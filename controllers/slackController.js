const handleSlackEvent = (req, res) => {
  const { type, event, challenge } = req.body
  if (type === 'url_verification') {
    res.send({ challenge })
    return
  }
  if (type === 'event_callback' && event && event.type === 'message') {
    
    console.log('New Slack message:', event.text)
  }
  res.status(200).send()
}

module.exports = { handleSlackEvent } 