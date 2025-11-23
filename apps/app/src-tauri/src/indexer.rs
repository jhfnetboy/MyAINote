use std::path::PathBuf;
use notify::{Watcher, RecursiveMode, Result, Event, EventKind};
use std::sync::mpsc::channel;
use std::time::Duration;
use std::fs;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct NoteRecord {
    pub filename: String,
    pub content: String,
    pub vector: Vec<f32>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct VectorStore {
    pub records: Vec<NoteRecord>,
}

pub struct Indexer {
    notes_dir: PathBuf,
    store_path: PathBuf,
    ocr: crate::ocr::OcrEngine,
}

impl Indexer {
    pub fn new(notes_dir: PathBuf) -> Self {
        let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        let store_path = PathBuf::from(home_dir).join("MyAINote").join("vectors.json");
        let ocr = crate::ocr::OcrEngine::new();
        Self { notes_dir, store_path, ocr }
    }

    pub async fn start(&self) {
        println!("Starting indexer for {:?} using JSON Store at {:?}", self.notes_dir, self.store_path);
        
        // Create a channel to receive the events.
        let (tx, rx) = channel();
        let mut watcher = notify::recommended_watcher(tx).unwrap();

        if let Err(e) = watcher.watch(&self.notes_dir, RecursiveMode::Recursive) {
            println!("Error watching directory: {:?}", e);
            return;
        }

        for res in rx {
            match res {
                Ok(event) => {
                    println!("Change: {:?}", event);
                    self.handle_event(event).await;
                },
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    }

    async fn handle_event(&self, event: Event) {
        match event.kind {
            EventKind::Create(_) | EventKind::Modify(_) => {
                for path in event.paths {
                    if path.extension().and_then(|s| s.to_str()) == Some("md") {
                        println!("Indexing file: {:?}", path);
                        let _ = self.index_file(path).await;
                    }
                }
            },
            _ => {}
        }
    }

    async fn index_file(&self, path: PathBuf) -> std::result::Result<(), Box<dyn std::error::Error>> {
        let mut content = std::fs::read_to_string(&path)?;
        let filename = path.file_name().unwrap().to_string_lossy().to_string();
        
        // OCR Logic
        let mut ocr_text = String::new();
        if let Some(start) = content.find("![") {
            if let Some(end) = content[start..].find(")") {
                let image_ref = &content[start..start+end+1];
                if let Some(url_start) = image_ref.find("](") {
                    let image_path_str = &image_ref[url_start+2..image_ref.len()-1];
                    if !image_path_str.starts_with("http") {
                         let full_image_path = self.notes_dir.join(image_path_str);
                         if full_image_path.exists() {
                             if let Ok(text) = self.ocr.process_image(&full_image_path) {
                                 if !text.is_empty() {
                                     ocr_text.push_str(&format!("\n\n[OCR Content]: {}\n", text));
                                 }
                             }
                         }
                    }
                }
            }
        }

        if !ocr_text.is_empty() {
            println!("Found OCR content for {}: {}", filename, ocr_text);
            content.push_str(&ocr_text);
        }

        // Generate Embedding
        let vector = crate::embedding::simple_embed(&content);

        // Load existing store
        let mut store: VectorStore = if self.store_path.exists() {
            let data = fs::read_to_string(&self.store_path)?;
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            VectorStore::default()
        };

        // Update or Add record
        if let Some(idx) = store.records.iter().position(|r| r.filename == filename) {
            store.records[idx] = NoteRecord { filename: filename.clone(), content, vector };
        } else {
            store.records.push(NoteRecord { filename: filename.clone(), content, vector });
        }

        // Save store
        let data = serde_json::to_string_pretty(&store)?;
        fs::write(&self.store_path, data)?;
        
        println!("(JSON) Indexed {}", filename);
        Ok(())
    }
}
