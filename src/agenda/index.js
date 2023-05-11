require('dotenv').config();
const Agenda = require('agenda');
const { gerarPedidoDeComprasJob } = require('./jobs');
const app = require('./app');

const { MONGO_URI, MONGO_DATABASE } = process.env;
const mongoConnectionString = `${MONGO_URI}/${MONGO_DATABASE}`;

const jobs = [
    gerarPedidoDeComprasJob
];

(async function() {
    try {
        const agenda = new Agenda({
            db: { address: mongoConnectionString }
        });
    
        jobs.forEach((job) => {
            agenda.define(job.name, {}, async () => {
                await job.command(app);
            });
        });
    
        await agenda.start();
    
        const agendamentos = jobs.map(async(job) => {
            await agenda.every(job.frequencia, job.name);
        });
    
        await Promise.all(agendamentos);
    
        console.log('Agenda ativa');
    } catch (error) {
        console.log(error);
    }
})();
