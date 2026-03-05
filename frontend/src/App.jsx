import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const initialFormState = {
  title: '',
  skill: '',
  difficulty: 'Beginner',
  description: '',
};

function App() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState(initialFormState);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/assessments`);
      setAssessments(response.data.data || []);
    } catch (err) {
      const message =
        err.response?.data?.error || 'Unable to load assessments. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError(null);

    if (!formValues.title.trim() || !formValues.skill.trim()) {
      setFormError('Title and skill are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formValues.title.trim(),
        skill: formValues.skill.trim(),
        difficulty: formValues.difficulty,
        description: formValues.description.trim(),
      };

      const response = await axios.post(`${API_BASE_URL}/api/assessments`, payload);

      const created = response.data.data;
      setAssessments((prev) => [created, ...prev]);
      setFormValues(initialFormState);
    } catch (err) {
      const message =
        err.response?.data?.error || 'Unable to create assessment. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Utkrusht Assessment Catalog</h1>

        <section style={styles.section}>
          <h2 style={styles.subheading}>Add New Assessment</h2>
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. JavaScript Fundamentals Quiz"
                value={formValues.title}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="skill">
                Skill
              </label>
              <input
                id="skill"
                name="skill"
                type="text"
                placeholder="e.g. JavaScript"
                value={formValues.skill}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="difficulty">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formValues.difficulty}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Short summary of what this assessment covers"
                value={formValues.description}
                onChange={handleInputChange}
                style={styles.textarea}
              />
            </div>

            {formError && <p style={styles.errorText}>{formError}</p>}

            <button
              type="submit"
              style={styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Create Assessment'}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subheading}>Available Assessments</h2>

          {loading && <p>Loading assessments...</p>}
          {error && <p style={styles.errorText}>{error}</p>}

          {!loading && !error && assessments.length === 0 && (
            <p>No assessments found. Add one using the form above.</p>
          )}

          <ul style={styles.list}>
            {assessments.map((assessment) => (
              <li key={assessment._id} style={styles.listItem}>
                <div style={styles.itemHeader}>
                  <h3 style={styles.itemTitle}>{assessment.title}</h3>
                  <span style={styles.badge}>{assessment.skill}</span>
                </div>
                <div style={styles.itemMeta}>
                  <span>Difficulty: {assessment.difficulty}</span>
                  {assessment.createdAt && (
                    <span>
                      Created:{' '}
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {assessment.description && (
                  <p style={styles.itemDescription}>{assessment.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '24px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  heading: {
    margin: 0,
    marginBottom: '16px',
    fontSize: '28px',
  },
  section: {
    marginTop: '24px',
  },
  subheading: {
    marginBottom: '12px',
    fontSize: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontWeight: 600,
    fontSize: '14px',
  },
  input: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  select: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  textarea: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    resize: 'vertical',
  },
  button: {
    marginTop: '8px',
    padding: '10px 14px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  listItem: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px 14px',
    backgroundColor: '#f9fafb',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '4px',
  },
  itemTitle: {
    margin: 0,
    fontSize: '16px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '12px',
    fontWeight: 600,
  },
  itemMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  itemDescription: {
    margin: 0,
    fontSize: '14px',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: '14px',
  },
};

export default App;
