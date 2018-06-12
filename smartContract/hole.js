"use strict";

class Tweet {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.text = obj.text;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class HoleContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userTweetIndexs");
        LocalContractStorage.defineMapProperty(this, "tweets", {
            parse: function (text) {
                return new Tweet(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    add(date, text) {
        let from = Blockchain.transaction.from;
        let index = this.count;

        let tweet = new Tweet();
        tweet.id = index;
        tweet.date = date;
        tweet.text = text;

        this.tweets.put(index, tweet);

        let userTweetIndexs = this.userTweetIndexs.get(from) || [];
        userTweetIndexs.push(index);

        this.userTweetIndexs.put(from, userTweetIndexs);

        this.count = new BigNumber(index).plus(1);
    }

    get() {
        let from = Blockchain.transaction.from;
        let tweetIds = this.userTweetIndexs.get(from);
        if (!tweetIds) {
            throw new Error(`Wallet = ${from} does not have any tweet `);
        }

        let arr = [];
        for (const id of tweetIds) {
            let tweet = this.tweets.get(id);
            if (tweet) {
                arr.push(tweet);
            }
        }
        return arr;
    }
}

module.exports = HoleContract;
