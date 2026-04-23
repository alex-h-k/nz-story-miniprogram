module.exports = {
  submitTrip: jest.fn(() => Promise.resolve({ id: 1 })),
  getTripDetail: jest.fn(() => Promise.resolve({ id: 1, status: 'waiting' })),
  wxLogin: jest.fn(() => Promise.resolve({ openid: 'mock_openid' })),
}
