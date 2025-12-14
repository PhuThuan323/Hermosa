const fs = require('fs');
const path = require('path');

const EVENT_FILE_PATH = path.join(__dirname, '..', '..', 'suggestion', 'events.csv');

function logEvent(visitorId, productId, eventName) {
    const timestamp = Date.now()
    const dataRow = `${timestamp},${visitorId},${eventName},${productId}\n`
    
    const fileExists = fs.existsSync(EVENT_FILE_PATH)
    const header = "timestamp,visitorid,event,productID\n"

    try {
        if (!fileExists) {
            fs.writeFileSync(EVENT_FILE_PATH, header, { flag: 'w' })
        }
        fs.writeFileSync(EVENT_FILE_PATH, dataRow, { flag: 'a' })
    } catch (err) {
        console.error('❌ Error writing to events.csv:', err.message)
    }
}

module.exports = { logEvent };