import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import sounddevice as sd
import threading
import time


class UltrasoundPlayer:
    
    def __init__(self, frequency: int = 18000, duration: float = 2.0, sample_rate: int = 44100):
        self.frequency = frequency
        self.duration = duration
        self.sample_rate = sample_rate
        self.is_playing = False
        self.thread = None
        self.stop_flag = False
        self.last_play_time = 0
        self.cooldown = 5.0
    
    def _generate_tone(self) -> np.ndarray:
        t = np.linspace(0, self.duration, int(self.sample_rate * self.duration))
        tone = np.sin(2 * np.pi * self.frequency * t)
        envelope = np.concatenate([
            np.linspace(0, 1, int(self.sample_rate * 0.1)),
            np.ones(int(self.sample_rate * (self.duration - 0.2))),
            np.linspace(1, 0, int(self.sample_rate * 0.1))
        ])
        if len(envelope) > len(tone):
            envelope = envelope[:len(tone)]
        elif len(envelope) < len(tone):
            tone = tone[:len(envelope)]
        return (tone * envelope * 0.5).astype(np.float32)
    
    def _play_loop(self):
        try:
            tone = self._generate_tone()
            sd.play(tone, self.sample_rate)
            sd.wait()
        except:
            pass
        finally:
            self.is_playing = False
    
    def play(self):
        now = time.time()
        if self.is_playing or (now - self.last_play_time) < self.cooldown:
            return False
        self.last_play_time = now
        self.is_playing = True
        self.thread = threading.Thread(target=self._play_loop, daemon=True)
        self.thread.start()
        return True
    
    def stop(self):
        try:
            sd.stop()
        except:
            pass
        self.is_playing = False

