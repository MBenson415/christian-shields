# fan sign up page
- name
- email
- phone number
- zip code
- opt in to texts
- confirm for texts
- confirm for email
- opt in to emails
- location / ip logging (browser location consent)
page should be mobile friendly and will open from an NFC tap. make form fields friendly to auto fill to acquire information. Location consent to customer location can be logged. Based on the date, log the likely show from Event (Event_Id)
Review table cs_fans and make necessary backend changes

# fan assist agent (claude)
the agent has access to the database and can answer questions about christian shields, shows (price, bands playing, set time, send ticket links and promotional materials, answer questions about merchandise (Stripe API)
- use claude api which can respond to chat box on site, or by text (Twilio API)

# ticketing
- for select shows, allow admin to create ticketing (creates product in Stripe) with price and show information. link Event_Id to ticket

# admin
- google login only allowed for benson.marshall@gmail.com and christianshields23@gmail.com
- fan list. can't edit, only view
- add, edit, remove Event where Band = Christian Shields
- ticketing management for Events
- interface for training agent through prompt / chatting. or is using Claude.ai direclty better?