import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MoodJournal.css';

interface MoodEntry {
  id: number;
  mood: string;
  note?: string;
  timestamp: string;
}

const MoodJournal: React.FC = () => {
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/journal');
      setEntries(res.data);
    } catch (e) {
      setError('Could not load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) return;
    try {
      await axios.post('http://localhost:3000/journal', { mood, note });
      setMood('');
      setNote('');
      fetchEntries();
    } catch (e) {
      setError('Could not add entry.');
    }
  };

  return (
    <div className="mood-journal">
      <h3>Mood Journal</h3>
      <form className="mood-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="How are you feeling today? (e.g. Happy, Anxious)"
          value={mood}
          onChange={e => setMood(e.target.value)}
          required
        />
        <textarea
          placeholder="Add a note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button type="submit">Add Entry</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="mood-entries">
          {entries.map(entry => (
            <li key={entry.id}>
              <span className="mood-label">{entry.mood}</span>
              {entry.note && <span className="mood-note"> - {entry.note}</span>}
              <span className="mood-time">{new Date(entry.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="mood-error">{error}</div>}
    </div>
  );
};

export default MoodJournal;
