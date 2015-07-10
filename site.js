var MAPPING = {
  '0': 'zero',  '1': 'one',  '2': 'two', '3': 'three',
  '4': 'four',  '5': 'five', '6': 'six', '7': 'seven',
  '8': 'eight', '9': 'nine',

  'a': 'alpha',   'b': 'bravo',    'c': 'charlie', 'd': 'delta',
  'e': 'echo',    'f': 'foxtrot',  'g': 'golf',    'h': 'hotel',
  'i': 'india',   'j': 'juliet',   'k': 'kilo',    'l': 'lima',
  'm': 'mike',    'n': 'november', 'o': 'oscar',   'p': 'papa',
  'q': 'quebec',  'r': 'romeo',    's': 'sierra',  't': 'tango',
  'u': 'uniform', 'v': 'victor',   'w': 'whiskey', 'x': 'x-ray',
  'y': 'yankee',  'z': 'zulu',

  '!': 'exclamation point',   '@': 'the at-symbol',
  '#': 'hash-mark',           '^': 'caret',
  '$': 'the dollar-symbol',   '%': 'the percent-symbol',
  '&': 'ampersand',           '*': 'asterisk',
  '_': 'underscore',          '+': 'plus-sign',
  '-': 'minus-sign',          '=': 'equals-sign',
  '(': 'open parenthesis',    ')': 'close parenthesis',
  '{': 'open curly-brace',    '}': 'close curly-brace',
  '[': 'open square-bracket', ']': 'close square-bracket',
  '\\': 'backslash',          '/': 'forward-slash',
  '|': 'pipe',                '?': 'question-mark',
  '.': 'period',              ',': 'comma',
  '<': 'less-than',           '>': 'greater-than',
  '\'': 'single-quote',       '"': 'double-quote',
  ';': 'semi-colon',          ':': 'colon',
  '`': 'backtick',            '~': 'tilde',
  ' ': 'a space'
}

var Prompt = React.createClass( {
  shouldComponentUpdate: function( nextProps ) {
    return nextProps.char !== this.props.char ||
           nextProps.done !== this.props.done
  },

  promptForChar: function( char ) {
    if( char != ' ' && !isNaN(char) ) {
      return 'the number ' + MAPPING[char]
    }
    else {
      var lower = char.toLowerCase()
      var code = lower.charCodeAt(0)

      if( code >= 97 && code <= 122 ) {
        return [
          MAPPING[char] ? 'lowercase' : 'uppercase', ' ',
          React.createElement( 'tt', null, char.toUpperCase() ),
          ' as in ', MAPPING[lower]
        ]
      }
      else {
        return MAPPING[char]
      }
    }
  },

  onClick: function() {
    this.props.toggleDone( this.props.index )
  },

  render: function() {
    return React.createElement(
      'li',
      {
        className: this.props.done ? 'done' : '',
        onClick: this.onClick
      },
      this.promptForChar( this.props.char )
    )
  }
} )

var Prompts = React.createClass( {
  getInitialState: function() { return { chars: [], charState: {} } },

  componentDidMount: function() { key( 'esc', this.toggleNext ) },
  componentWillUnmount: function() { key.unbind( 'esc', this.toggleNext ) },

  componentWillReceiveProps: function( nextProps ) {
    var chars = nextProps.text.split('')

    var updates = {}
    if( nextProps.text != this.props.text ) {
      updates.chars = { $set: chars }
    }

    var charState = {}
    for( var i = 0; i < chars.length; i++ ) {
      charState[i] = false
    }
    updates.charState = { $merge: charState }

    var newState = React.addons.update( this.state, updates )
    this.setState( newState )
  },

  toggleNext: function() {
    var chars = this.state.chars
    for( var i = 0; i < chars.length; i++ ) {
      var char = chars[i]
      if( !this.state.charState[i] ) {
        this.toggle( i )
        break
      }
    }
  },
  toggle: function( i ) {
    var updates = { charState: {} }
    updates.charState[i] = { $set: !this.state.charState[i] }

    var newState = React.addons.update( this.state, updates )
    this.setState( newState )
  },

  render: function() {
    if( this.props.text == '' ) { return null }

    var prompts = []
    for( var i = 0; i < this.state.chars.length; i++ ) {
      var char = this.state.chars[i]
      prompts.push(
        React.createElement( Prompt, {
          key: i, char: char, index: i,
          done: this.state.charState[i],
          toggleDone: this.toggle
        } )
      )
    }

    return React.createElement( 'ul', null, prompts )
  }
} )

var App = React.createClass( {
  getInitialState: function() { return { text: '' } },

  componentDidMount: function() { key( 'esc', this.blur ) },
  componentWillUnmount: function() { key.unbind( 'esc', this.blur ) },

  blur: function() {
    this.refs.input.blur()
  },

  change: function() {
    this.setState( { text: this.refs.input.value } )
  },

  render: function() {
    return React.createElement( 'div', { className: 'row' },
      React.createElement( 'input', {
        ref: 'input',
        spellCheck: false,
        autoComplete: false,
        autoFocus: true,
        placeholder: 'annoying text here',
        onChange: this.change
      } ),
      React.createElement( Prompts, { text: this.state.text } )
    )
  }
} )

// always listen to keypresses (even in inputs)
key.filter = function() { return true }

document.addEventListener( 'DOMContentLoaded', function() {
  React.render(
    React.createElement( App ),
    document.getElementById( 'app' )
  )
} )
