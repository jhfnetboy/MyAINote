use std::path::PathBuf;
use notify::{Watcher, RecursiveMode, Result, Event, EventKind};
use std::sync::mpsc::channel;
use std::time::Duration;
use lancedb::{connect, Table, TableRef};
use arrow_array::{RecordBatch, RecordBatchIterator, ArrayRef, Float32Array, StringArray};
use arrow_array::types::Float32Type;
use std::sync::Arc;
use arrow_schema::{DataType, Field, Schema};
use futures::TryStreamExt;

pub struct Indexer {
    notes_dir: PathBuf,
    db_path: String,
}

impl Indexer {
    pub fn new(notes_dir: PathBuf) -> Self {
        let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        let db_path = format!("{}/MyAINote/.db", home_dir);
        Self { notes_dir, db_path }
    }

    pub async fn start(&self) {
        println!("Starting indexer for {:?} using DB at {}", self.notes_dir, self.db_path);
        
        // Initialize DB
        let _ = self.init_db().await;

        // Create a channel to receive the events.
        let (tx, rx) = channel();

        // Create a watcher object, delivering debounced events.
        let mut watcher = notify::recommended_watcher(tx).unwrap();

        // Add a path to be watched.
        if let Err(e) = watcher.watch(&self.notes_dir, RecursiveMode::Recursive) {
            println!("Error watching directory: {:?}", e);
            return;
        }

        // Process events
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

    async fn init_db(&self) -> std::result::Result<(), lancedb::Error> {
        let uri = format!("data/{}", self.db_path); // LanceDB local path
        let db = connect(&uri).execute().await?;
        
        // Define Schema
        // id: String, content: String, vector: Float32[384] (MiniLM size)
        // For mock, let's use size 4
        
        // Check if table exists
        let table_names = db.table_names().execute().await?;
        if !table_names.contains(&"notes".to_string()) {
            println!("Creating 'notes' table...");
            // We create it lazily on first insert for simplicity or use empty batch
        }
        Ok(())
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
        let content = std::fs::read_to_string(&path)?;
        let filename = path.file_name().unwrap().to_string_lossy().to_string();
        
        // Generate Embedding (Size 384)
        let vector = crate::embedding::simple_embed(&content);

        // Connect to DB
        let uri = format!("data/{}", self.db_path);
        let db = connect(&uri).execute().await?;
        
        // Create RecordBatch
        let schema = Arc::new(Schema::new(vec![
            Field::new("filename", DataType::Utf8, false),
            Field::new("content", DataType::Utf8, false),
            Field::new("vector", DataType::FixedSizeList(
                Arc::new(Field::new("item", DataType::Float32, true)),
                384
            ), false),
        ]));

        let filenames = StringArray::from(vec![filename.clone()]);
        let contents = StringArray::from(vec![content.clone()]);
        
        // Flatten vector
        let values = Float32Array::from(vector.clone());
        let field = Arc::new(Field::new("item", DataType::Float32, true));
        let vectors = arrow_array::FixedSizeListArray::try_new(
            field,
            384,
            Arc::new(values),
            None
        )?;

        let batch = RecordBatch::try_new(
            schema.clone(),
            vec![
                Arc::new(filenames),
                Arc::new(contents),
                Arc::new(vectors),
            ],
        )?;

        // Open Table and Add
        let table_name = "notes";
        let table = if db.table_names().execute().await?.contains(&table_name.to_string()) {
            db.open_table(table_name).execute().await?
        } else {
            db.create_table(table_name, RecordBatchIterator::new(vec![batch.clone()].into_iter().map(Ok), schema.clone()))
                .execute()
                .await?
        };

        if db.table_names().execute().await?.contains(&table_name.to_string()) {
             // Append if exists (logic simplified, usually we'd upsert or delete old first)
             // For now, just append
             table.add(RecordBatchIterator::new(vec![batch].into_iter().map(Ok), schema.clone())).execute().await?;
        }

        println!("(Mock) Indexed {} with vector {:?}", filename, vector);
        
        Ok(())
    }
}
