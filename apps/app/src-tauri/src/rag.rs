use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub title: String,
    pub path: String,
    pub score: f32,
    pub content_snippet: String,
}

pub async fn search(query: &str) -> Vec<SearchResult> {
    println!("Searching for: {}", query);
    
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let store_path = PathBuf::from(home_dir).join("MyAINote").join("vectors.json");

    // Generate Embedding for query (Size 384)
    let query_vector = crate::embedding::simple_embed(query);

    if !store_path.exists() {
        return vec![];
    }

    let data = match fs::read_to_string(&store_path) {
        Ok(d) => d,
        Err(_) => return vec![],
    };

    let store: crate::indexer::VectorStore = match serde_json::from_str(&data) {
        Ok(s) => s,
        Err(_) => return vec![],
    };

    let mut results: Vec<SearchResult> = store.records.iter().map(|record| {
        // Cosine Similarity
        let dot_product: f32 = record.vector.iter().zip(&query_vector).map(|(a, b)| a * b).sum();
        let norm_a: f32 = record.vector.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = query_vector.iter().map(|x| x * x).sum::<f32>().sqrt();
        let score = if norm_a > 0.0 && norm_b > 0.0 {
            dot_product / (norm_a * norm_b)
        } else {
            0.0
        };

        SearchResult {
            title: record.filename.clone(),
            path: record.filename.clone(), // In real app, full path
            score,
            content_snippet: record.content.chars().take(200).collect(),
        }
    }).collect();

    // Sort by score descending
    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));

    results.into_iter().take(5).collect()
}

pub async fn chat(query: &str) -> String {
    println!("Chatting with query: {}", query);
    
    // 1. Search for relevant context
    let results = search(query).await;
    
    if results.is_empty() {
        return "I couldn't find any relevant notes to answer your question.".to_string();
    }

    // 2. Construct a simple answer based on the top result
    // In a real RAG, we would feed this to an LLM.
    // For now, we simulate it by returning the most relevant snippet.
    let top_result = &results[0];
    
    format!(
        "Based on your note '{}' (Score: {:.2}):\n\n{}\n\n(Note: Full LLM generation coming in next phase)", 
        top_result.title, 
        top_result.score, 
        top_result.content_snippet.chars().take(200).collect::<String>()
    )
}
