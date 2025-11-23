use anyhow::Result;

// Simple deterministic embedding for demo purposes (if real model fails)
// This allows us to test "semantic" search without the heavy model weight
pub fn simple_embed(text: &str) -> Vec<f32> {
    let mut vector = vec![0.0f32; 384];
    for (i, byte) in text.bytes().enumerate() {
        vector[i % 384] += (byte as f32) / 255.0;
    }
    // Normalize
    let magnitude: f32 = vector.iter().map(|x| x * x).sum::<f32>().sqrt();
    if magnitude > 1e-6 {
        for x in vector.iter_mut() {
            *x /= magnitude;
        }
    }
    vector
}
