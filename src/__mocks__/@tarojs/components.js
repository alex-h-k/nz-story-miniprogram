// Render all Taro components as plain HTML equivalents for jsdom testing
const React = require('react')

const make = (tag) => React.forwardRef(({ children, className, style, onClick, onTouchStart, onTouchEnd, onTouchCancel, onLoad, ...rest }, ref) =>
  React.createElement(tag, { ref, className, style, onClick, onTouchStart, onTouchEnd, onTouchCancel, onLoad, 'data-testid': rest['data-testid'] }, children)
)

module.exports = {
  View:     make('div'),
  Text:     make('span'),
  Button:   make('button'),
  Image:    make('img'),
  Input:    make('input'),
  Textarea: make('textarea'),
  Map:      make('div'),
  Picker:   ({ children, onChange, ...rest }) =>
    React.createElement('div', { 'data-testid': 'picker', onClick: () => onChange?.({ detail: { value: 0 } }) }, children),
  ScrollView: make('div'),
}
