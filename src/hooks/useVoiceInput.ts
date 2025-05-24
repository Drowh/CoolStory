"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: unknown;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface UseVoiceInputResult {
  isListening: boolean;
  transcript: string;
  toggleListening: () => void;
  error: string | null;
  clearTranscript: () => void;
  updateTranscript: (text: string) => void;
  speechLevel: number;
}

export const useVoiceInput = (): UseVoiceInputResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [speechLevel, setSpeechLevel] = useState(0);
  const wasManuallyCleared = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ru-RU";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let fullTranscript = "";
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (wasManuallyCleared.current) {
            setTranscript(fullTranscript);
            wasManuallyCleared.current = false;
          } else {
            setTranscript(fullTranscript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognition);
      } else {
        setError("Ваш браузер не поддерживает голосовой ввод");
      }
    }
  }, []);

  useEffect(() => {
    if (!isListening) {
      cleanupAudioResources();
      return;
    }
    let stream: MediaStream;
    let stopped = false;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (stopped) return;
        stream = s;
        setupAudioProcessing(stream);
      })
      .catch((err) => {
        setError("Ошибка доступа к микрофону: " + err.message);
        setIsListening(false);
      });
    return () => {
      stopped = true;
      cleanupAudioResources();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isListening]);

  const cleanupAudioResources = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setSpeechLevel(0);
  };

  const setupAudioProcessing = (stream: MediaStream) => {
    const audioContext = new window.AudioContext();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    dataArrayRef.current = dataArray;
    const update = () => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i] - 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length) / 128;
      setSpeechLevel(rms);
      rafIdRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
      setError(null);
    }
  }, [isListening, recognition]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    wasManuallyCleared.current = true;
  }, []);

  const updateTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  return {
    isListening,
    transcript,
    toggleListening,
    error,
    clearTranscript,
    updateTranscript,
    speechLevel,
  };
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
