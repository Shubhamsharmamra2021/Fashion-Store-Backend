const twilio = require("twilio");

class Twilio {
  phoneNumber = process.env.PHONENUMBER;
  phoneNumberSid = process.env.PHONENUMBERSID;
  tokenSid = process.env.TOKENSID;
  tokenSecret = process.env.TOKENSECRET;
  accountSid = process.env.ACCOUNTSID;
  verify = process.env.VERIFY;
  client;
  constructor() {
    this.client = twilio(this.tokenSid, this.tokenSecret, {
      accountSid: this.accountSid,
    });
  }

  getTwilio() {
    this.client;
  }

  async sendVerify(to, channel) {
    const data = await this.client.verify
      .services(this.verify)
      .verifications.create({
        to,
        channel,
      });
    return data;
  }

  async verifyCode(to, code) {
    const data = await this.client.verify
      .services(this.verify)
      .verificationChecks.create({
        to,
        code,
      });
    return data;
  }
}

const instance = new Twilio();
Object.freeze(instance);

module.exports = instance;
