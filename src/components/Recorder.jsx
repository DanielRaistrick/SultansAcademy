import { useState, useEffect, useRef, useCallback } from 'react';
import { saveRecording, getAllRecordings, deleteRecording } from '../utils/recordingsDB';
import './Recorder.css';

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const getPreferredMimeType = () => {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
};

// ─── Recording list item ──────────────────────────────────────────────────────

const RecordingItem = ({ recording, isPlaying, onPlay, onDownload, onDelete, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(recording.name);

  const commit = () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== recording.name) onRename(trimmed);
    else setName(recording.name);
  };

  return (
    <div className={`recording-item ${isPlaying ? 'playing' : ''}`}>
      <div className="recording-info">
        {editing ? (
          <input
            className="recording-name-edit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            autoFocus
          />
        ) : (
          <span
            className="recording-name"
            onClick={() => setEditing(true)}
            title="Click to rename"
          >
            {recording.name}
          </span>
        )}
        <span className="recording-meta">
          {formatDuration(recording.duration)} &middot;{' '}
          {new Date(recording.date).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="recording-actions">
        <button
          className={`rec-btn btn-play ${isPlaying ? 'active' : ''}`}
          onClick={onPlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="rec-btn btn-download" onClick={onDownload} title="Download">
          ⬇
        </button>
        <button className="rec-btn btn-delete" onClick={onDelete} title="Delete">
          🗑
        </button>
      </div>
    </div>
  );
};

// ─── Main recorder ────────────────────────────────────────────────────────────

const Recorder = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [timer, setTimer] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const durationRef = useRef(0);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioRef = useRef(new Audio());

  // ── Load saved recordings ──────────────────────────────────────────────────
  useEffect(() => {
    getAllRecordings().then(setRecordings).catch(console.error);
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      audio.pause();
    };
  }, []);

  // ── Draw idle flat line on canvas once mounted ─────────────────────────────
  useEffect(() => {
    drawIdleLine();
  }, []);

  const drawIdleLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(10, 14, 26)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  // ── Enumerate devices (labels only appear after permission is granted) ─────
  const enumerateDevices = useCallback(async () => {
    const all = await navigator.mediaDevices.enumerateDevices();
    const inputs = all.filter((d) => d.kind === 'audioinput');
    setDevices(inputs);
    if (inputs.length > 0 && !selectedDevice) {
      setSelectedDevice(inputs[0].deviceId);
    }
  }, [selectedDevice]);

  useEffect(() => {
    enumerateDevices();
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
  }, [enumerateDevices]);

  // ── Request mic permission so device labels become visible ─────────────────
  const requestPermission = async () => {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
      tmp.getTracks().forEach((t) => t.stop());
      setPermissionGranted(true);
      setError('');
      await enumerateDevices();
    } catch {
      setError('Microphone permission denied. Please allow access in your browser settings.');
    }
  };

  // ── Live waveform visualiser ───────────────────────────────────────────────
  const startVisualiser = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sliceWidth = canvas.width / bufferLength;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(10, 14, 26)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00d4ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00d4ff';
      ctx.beginPath();

      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();
  }, []);

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    setError('');
    try {
      const audioConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        ...(selectedDevice ? { deviceId: { exact: selectedDevice } } : {}),
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Re-enumerate now that we have permission — labels will be populated
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((d) => d.kind === 'audioinput'));

      // Audio context for visualiser
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder
      const mimeType = getPreferredMimeType();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const rec = {
          id: Date.now().toString(),
          name: `Recording – ${new Date().toLocaleString()}`,
          date: new Date().toISOString(),
          duration: durationRef.current,
          blob,
          mimeType: mr.mimeType || 'audio/webm',
        };
        await saveRecording(rec);
        const updated = await getAllRecordings();
        setRecordings(updated);
      };

      mr.start(100);
      durationRef.current = 0;
      setTimer(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setTimer((t) => t + 1);
      }, 1000);

      startVisualiser();
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('Selected audio device not found. Try a different input.');
      } else {
        setError(`Could not start recording: ${err.message}`);
      }
    }
  };

  // ── Stop recording ─────────────────────────────────────────────────────────
  const stopRecording = () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setIsRecording(false);
    drawIdleLine();
  };

  // ── Playback ───────────────────────────────────────────────────────────────
  const handlePlay = (recording) => {
    if (playingId === recording.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    const url = URL.createObjectURL(recording.blob);
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.play();
    audioRef.current.onended = () => {
      URL.revokeObjectURL(url);
      setPlayingId(null);
    };
    setPlayingId(recording.id);
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = (recording) => {
    const ext = recording.mimeType?.includes('webm')
      ? 'webm'
      : recording.mimeType?.includes('ogg')
      ? 'ogg'
      : 'mp4';
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (playingId === id) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    await deleteRecording(id);
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Rename ─────────────────────────────────────────────────────────────────
  const handleRename = async (id, newName) => {
    const rec = recordings.find((r) => r.id === id);
    if (!rec) return;
    const updated = { ...rec, name: newName };
    await saveRecording(updated);
    setRecordings((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="recorder">
      <div className="recorder-header">
        <h2>Guitar Recorder</h2>
        <p className="recorder-subtitle">
          Capture your playing via the Spark Neo or any audio input
        </p>
      </div>

      {/* ── Device & controls panel ── */}
      <div className="recorder-panel">
        <div className="recorder-device-row">
          <label htmlFor="audio-device" className="device-label">
            Audio Input
          </label>
          <div className="device-select-wrap">
            <select
              id="audio-device"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              disabled={isRecording}
              className="device-select"
            >
              {devices.length === 0 && <option value="">No devices found</option>}
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone (${d.deviceId.slice(0, 8)}…)`}
                </option>
              ))}
            </select>
            {!permissionGranted && (
              <button className="btn-show-devices" onClick={requestPermission}>
                Show device names
              </button>
            )}
          </div>
        </div>

        {/* ── Waveform canvas ── */}
        <div className="recorder-visualizer">
          <canvas ref={canvasRef} width={720} height={100} />
        </div>

        {/* ── Controls ── */}
        <div className="recorder-controls">
          <div className={`recorder-timer ${isRecording ? 'recording' : ''}`}>
            {isRecording && <span className="rec-dot" />}
            <span className="timer-value">{formatDuration(timer)}</span>
          </div>

          {!isRecording ? (
            <button className="btn-record" onClick={startRecording}>
              ⏺ &nbsp;Start Recording
            </button>
          ) : (
            <button className="btn-stop" onClick={stopRecording}>
              ⏹ &nbsp;Stop Recording
            </button>
          )}
        </div>

        {error && <div className="recorder-error">{error}</div>}


      </div>

      {/* ── Saved recordings ── */}
      <div className="recordings-section">
        <h3 className="recordings-heading">
          Saved Recordings
          {recordings.length > 0 && (
            <span className="recordings-count">{recordings.length}</span>
          )}
        </h3>

        {recordings.length === 0 ? (
          <div className="recordings-empty">
            No recordings yet — hit the button above to start!
          </div>
        ) : (
          <div className="recordings-list">
            {recordings.map((r) => (
              <RecordingItem
                key={r.id}
                recording={r}
                isPlaying={playingId === r.id}
                onPlay={() => handlePlay(r)}
                onDownload={() => handleDownload(r)}
                onDelete={() => handleDelete(r.id)}
                onRename={(name) => handleRename(r.id, name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;
