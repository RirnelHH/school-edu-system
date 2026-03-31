import request from './request';

export interface LoginResponse {
  access_token: string;
  user: any;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return await request.post('/api/v1/auth/login', { username, password }) as LoginResponse;
}

export async function getProfile() {
  return request.get('/api/v1/auth/profile');
}

export async function logout() {
  return request.post('/api/v1/auth/logout');
}
