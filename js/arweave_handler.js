var arweave_handler = {
    init: async function() {
        this.arweave = Arweave.init();
        this.arweave.network.getInfo().then(console.log);
        return 'init done';
    },
    arweave: null,
    loggedIn: false,
    jwk: false,
    address: false,
    balance: false,
    login: async function(jwk) {
        this.jwk = jwk;
        try {
            if (typeof beforeLogin === 'function') beforeLogin();
            this.arweave.wallets.jwkToAddress(jwk).then((address) => {
                this.address = address;
                this.loggedIn = true;
                this.arweave.wallets.getBalance(address).then((balance) => {
                    let winston = balance;
                    let _ar = this.arweave.ar.winstonToAr(balance);
                    this.balance = {
                        winston: winston,
                        ar: _ar,
                    };
                    if (typeof onLoginSuccess === 'function') onLoginSuccess();
                    console.log("logged in");
                    document.getElementById("game-info").innerHTML = "Logged In";
                    document.getElementById("game-info").innerHTML = "Please enter your name";
                    document.getElementById("login").style.display = "none";
                    document.getElementById("player-name-wrapper").style.display = "block";
                    document.getElementById("player-name-input").focus();

                });
            });
        } catch (e) {
            if (typeof onLoginError === 'function') onLoginError(e);
        }
    },
    submitTrans: async function(data) {
        if (!this.loggedIn) throw ('Please login via keyfile upload');
        let tx = await this.arweave.createTransaction({
            data: data,
        }, this.jwk);

        tx.addTag('App', 'Permatris');
        tx.addTag('App-Version', '1.0.0');
        tx.addTag('Type', 'score');

        await this.arweave.transactions.sign(tx, this.jwk);
        return await this.arweave.transactions.post(tx);
    },
    getPermaBoard: async function() {
        let txids = await arweave_handler.arweave.arql({
            op: "and",
            expr1: {
                op: 'equals',
                expr1: 'App',
                expr2: 'Permatris'
            },
            expr2: {
                op: 'equals',
                expr1: 'Type',
                expr2: 'score'
            }
        });

        let permaboard = [];
        let tempboard = []
        try {
            permaboard = await Promise.all(txids.map(async txid => {
                let tx = await arweave_handler.arweave.transactions.get(txid);

                let data = tx.get('data', { decode: true, string: true }).toString();
                try {
                    scoreData = JSON.parse(data);
                    //        console.log(scoreData);
                } catch (e) {
                    console.log(e);
                }
                return Promise.resolve(scoreData);

            }));
        } catch (e) {
            console.log("Caught Error.Blocks are getting mined", e);
            document.getElementById("game-info").innerHTML = "Looks like all blocks are not mined.You can continue playing though.";
            for (let i = 0; i < txids.length; i++) {
                let tx;
                try {
                    tx = await arweave_handler.arweave.transactions.get(txids[i]);
                } catch (e) {
                    continue;
                }

                let data = tx.get('data', { decode: true, string: true }).toString();
                try {
                    scoreData = JSON.parse(data);
                    //  console.log(scoreData);
                    tempboard.push(scoreData);
                } catch (e) {
                    console.log(e);
                }
            }
            tempboard.sort(function(a, b) {
                return b.score - a.score;
            });

            return tempboard;
        }

        //  console.log(permaboard);

        permaboard.sort(function(a, b) {
            return b.score - a.score;
        });

        return permaboard;
    }
};