import api from './api';

export async function getSubjects(params) {
  const { data } = await api.get('/api/results/subjects', { params });
  return data.subjects ?? [];
}

export async function getFacultyResults(params) {
  const { data } = await api.get('/api/results/faculty', { params });
  return data.results ?? [];
}

export async function saveResultRows(payload) {
  const { data } = await api.post('/api/results', payload);
  return data;
}

export async function publishResults(payload) {
  const { data } = await api.post('/api/results/publish', payload);
  return data;
}

export async function lockResults(payload) {
  const { data } = await api.post('/api/results/lock', payload);
  return data;
}

export async function getFacultyResultAnalytics(params) {
  const { data } = await api.get('/api/results/analytics', { params });
  return data.analytics ?? {};
}

export async function getStudentResults() {
  const { data } = await api.get('/api/results/student/me');
  return data;
}
