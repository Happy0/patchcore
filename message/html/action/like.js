var { h, computed, when, send } = require('mutant')
var nest = require('depnest')

exports.needs = nest({
  'keys.sync.id': 'first',
  'message.obs.likes': 'first',
  'sbot.async.publish': 'first'
})

exports.gives = nest('message.html.action')

exports.create = (api) => {
  return nest('message.html.action', function (msg) {
    var id = api.keys.sync.id()
    var liked = computed([api.message.obs.likes(msg.key), id], doesLike)
    return when(liked,
      h('a.unlike', {
        href: '#',
        'ev-click': send(unlike, msg)
      }, 'Unlike'),
      h('a.like', {
        href: '#',
        'ev-click': send(like, msg)
      }, 'Like')
    )
  })

  function like (msg) {
    publishLike(msg, true)
  }

  function unlike (msg) {
    publishLike(msg, false)
  }

  function publishLike (msg, status = true) {
    var like = status ? {
      type: 'vote',
      channel: msg.value.content.channel,
      vote: { link: msg.key, value: 1, expression: 'Like' }
    } : {
      type: 'vote',
      channel: msg.value.content.channel,
      vote: { link: msg.key, value: 0, expression: 'Unlike' }
    }
    if (msg.value.content.recps) {
      like.recps = msg.value.content.recps.map(function (e) {
        return e && typeof e !== 'string' ? e.link : e
      })
      like.private = true
    }
    api.sbot.async.publish(like)
  }
}

function doesLike (likes, userId) {
  return likes.includes(userId)
}

