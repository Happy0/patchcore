var h = require('mutant/h')

exports.gives = 'message_action'

exports.create = function () {
  return function (msg) {
    return h('a', { href: '#' + msg.key }, 'Reply')
  }
}
