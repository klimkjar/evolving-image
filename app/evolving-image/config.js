var evolver = self.evolver || {};

evolver.config = {
  triangleStripMinPoints: 3,
  triangleStripMaxPoints: 10,
  imageMinComponents: 0,
  imageMaxComponents: 50,
  mutationRate: 1000,
  progressRefreshRate: 1000 / 25,
  statBufferLength: 100,
  keepEvery: 100,
  updateRefreshRate: 1000 / 2,
  workers: 3
};