use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use anyhow::Result;
use std::sync::mpsc;

pub struct AudioRecorder {
    stop_signal: Arc<Mutex<Option<mpsc::Sender<()>>>>,
    is_recording: Arc<Mutex<bool>>,
}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            stop_signal: Arc::new(Mutex::new(None)),
            is_recording: Arc::new(Mutex::new(false)),
        }
    }

    pub fn start_recording(&self, output_path: PathBuf) -> Result<()> {
        let (tx, rx) = mpsc::channel();
        *self.stop_signal.lock().unwrap() = Some(tx);
        *self.is_recording.lock().unwrap() = true;

        println!("Recording started to {:?}", output_path);

        std::thread::spawn(move || {
            let host = cpal::default_host();
            let device = match host.default_input_device() {
                Some(d) => d,
                None => {
                    eprintln!("No input device available");
                    return;
                }
            };
            let config = match device.default_input_config() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("Error getting config: {}", e);
                    return;
                }
            };

            let spec = hound::WavSpec {
                channels: config.channels(),
                sample_rate: config.sample_rate().0,
                bits_per_sample: 16,
                sample_format: hound::SampleFormat::Int,
            };

            let mut writer = match hound::WavWriter::create(&output_path, spec) {
                Ok(w) => w,
                Err(e) => {
                    eprintln!("Error creating wav writer: {}", e);
                    return;
                }
            };

            let err_fn = move |err| {
                eprintln!("an error occurred on stream: {}", err);
            };

            let writer = Arc::new(Mutex::new(Some(writer)));
            let writer_clone = writer.clone();

            let stream = match config.sample_format() {
                cpal::SampleFormat::F32 => device.build_input_stream(
                    &config.into(),
                    move |data: &[f32], _: &_| {
                        if let Ok(mut w_guard) = writer_clone.lock() {
                            if let Some(w) = w_guard.as_mut() {
                                for &sample in data {
                                    let amplitude = i16::MAX as f32;
                                    w.write_sample((sample * amplitude) as i16).ok();
                                }
                            }
                        }
                    },
                    err_fn,
                    None,
                ),
                _ => return, // Unsupported format
            };

            if let Ok(stream) = stream {
                if let Ok(_) = stream.play() {
                    // Wait for stop signal
                    let _ = rx.recv();
                }
            }
            
            // Stream is dropped here, stopping recording.
            // Finalize writer
            if let Ok(mut w_guard) = writer.lock() {
                if let Some(w) = w_guard.take() {
                    let _ = w.finalize();
                }
            }
            println!("Recording thread finished");
        });
        
        Ok(())
    }

    pub fn stop_recording(&self) -> Result<()> {
        *self.is_recording.lock().unwrap() = false;
        
        if let Some(tx) = self.stop_signal.lock().unwrap().take() {
            let _ = tx.send(());
        }

        println!("Recording stopped signal sent");
        Ok(())
    }
}
