import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import fs from 'fs';

/* wallet.ts/.js dosyasında aşağıdaki komutlar belirtilen işlemleri yapmalıdır.
- new komutu ile Solana üzerinde bir cüzdan oluşturup, cüzdan bilgileri aynı dosyadaki wallet.json dosyasına kaydedilmelidir.
-- Aynı zamanda oluşturulan cüzdanın json dosyasında bakiyesi de kaydedilmelidir.

- airdrop [X] komutu ile X kadar ya da varsayılan olarak 1 SOL airdrop yapılacak.

- balance komutu ile önceki adımda oluşturulan cüzdan için bakiye kontrolü yapılmalıdır.

- transer [otherPublicKey][Amount] komutu  otherPublicKey parametresine girilen cüzdan adresine Amount parametresine girilen değer kadar transfer yapması gerekli ve işlem sonucu ekrana yazılmalıdır.
-- Bu transfer önceki adımlarda oluşturduğun cüzdan adresinden yapılmalıdır. */

class SolanaWallet {
    keypair: Keypair;

    constructor() {
        this.keypair = Keypair.generate();
    }

    /* - new komutu ile Solana üzerinde bir cüzdan oluşturup, cüzdan bilgileri aynı dosyadaki wallet.json dosyasına kaydedilmelidir.
    -- Aynı zamanda oluşturulan cüzdanın json dosyasında bakiyesi de kaydedilmelidir. */
    async createWallet() {
        const walletData = {
            publicKey: this.keypair.publicKey.toString(),
            secretKey: [...this.keypair.secretKey]
        };

        fs.writeFileSync('wallet2.json', JSON.stringify(walletData, null, 2));

        console.log('Wallet created:', walletData.publicKey);
    }

    /* - airdrop [X] komutu ile X kadar ya da varsayılan olarak 1 SOL airdrop yapılacak. */
    async airdrop(connection: Connection, amount: number = 1) {
        const airdropSignature = await connection.requestAirdrop(
            this.keypair.publicKey,
            amount * LAMPORTS_PER_SOL
        );

        await connection.confirmTransaction(airdropSignature);

        console.log(`Airdropped ${amount} SOL to the wallet`);
    }

    /* - balance komutu ile önceki adımda oluşturulan cüzdan için bakiye kontrolü yapılmalıdır. */
    async getBalance(connection: Connection) {
        const balance = await connection.getBalance(this.keypair.publicKey);
        console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    }
/*
    async transfer(connection: Connection, otherPublicKey: string, amount: number) {
        const transaction = await connection.requestAirdrop(
            new PublicKey(otherPublicKey),
            amount * LAMPORTS_PER_SOL
        );

        await connection.confirmTransaction(transaction);

        console.log(Transferred ${amount} SOL to ${otherPublicKey});
    }
*/
    async transfer(connection: Connection, otherPublicKey: string, amount: number) {
    const fromPublicKey = this.keypair.publicKey;
    const toPublicKey = new PublicKey(otherPublicKey);

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );
    
    /* - transfer [otherPublicKey][Amount] komutu  otherPublicKey parametresine girilen cüzdan adresine Amount parametresine girilen değer kadar transfer yapması gerekli ve işlem sonucu ekrana yazılmalıdır. */
    const signature = await sendAndConfirmTransaction(connection, transaction, [this.keypair]);
    console.log(`Transferred ${amount} SOL to ${otherPublicKey}, Transaction Signature: ${signature}`);
}

}

async function main() {
    const wallet = new SolanaWallet();
    await wallet.createWallet();

    const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

    await wallet.airdrop(connection, 5);

    await wallet.getBalance(connection);

}

main();