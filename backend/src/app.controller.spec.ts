import { AppController } from './app.controller.js';

describe('AppController', () => {
  it('reports that the backend is running', () => {
    expect(new AppController().getStatus()).toEqual({ status: 'ok' });
  });
});
