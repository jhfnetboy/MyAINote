use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub title: String,
    pub path: String,
    pub score: f32,
    pub content_snippet: String,
}

use lancedb::connect;
use futures::TryStreamExt;
use arrow_array::RecordBatch;

pub async fn search(query: &str) -> Vec<SearchResult> {
    println!("Searching for: {}", query);
    
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let db_path = format!("{}/MyAINote/.db", home_dir);
    let uri = format!("data/{}", db_path);

    // Generate Embedding for query (Size 384)
    let query_vector = crate::embedding::simple_embed(query);

    let Ok(db) = connect(&uri).execute().await else {
        return vec![];
    };

    let Ok(table) = db.open_table("notes").execute().await else {
        return vec![];
    };

    // Perform Vector Search
    let results = table
        .query()
        .nearest_to(&query_vector)
        .limit(5)
        .execute()
        .await;

    match results {
        Ok(mut stream) => {
            let mut search_results = Vec::new();
            while let Ok(Some(batch)) = stream.try_next().await {
                // Extract data from batch
                // This requires casting columns. 
                // For now, let's just return a mock result if we found something
                if batch.num_rows() > 0 {
                     search_results.push(SearchResult {
                        title: "Found Note".to_string(),
                        path: "path/to/note.md".to_string(),
                        score: 0.99,
                        content_snippet: "Content from LanceDB...".to_string(),
                    });
                }
            }
            search_results
        }
        Err(e) => {
            println!("Search error: {:?}", e);
            vec![]
        }
    }
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
