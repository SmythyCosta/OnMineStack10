const parseStringAsArray = require('../utils/parseStringAsArray');
const pinPointLocation = require('../utils/pinPointLocation');
const { listDevs,
    validateUsername,
    getUserData,
    createDev,
    updateDevData,
    findDevToDelete,
    deleteDev
    } = require('../services/DevService');


module.exports = {

    async index(req, res) {
        const devs = await listDevs()
        return res.json(devs);
    },

    async store(req, res) {
        const { github_username, techs, latitude, longitude } = req.body;
        let dev = await validateUsername(github_username);

        if (!dev) {
            const response = await getUserData(github_username);
            const { name = login, avatar_url, bio } = response.data;
            const techsArray = parseStringAsArray(techs);
            const location = pinPointLocation(longitude, latitude);
    
            dev = await createDev(
                github_username,
                name,
                avatar_url,
                bio,
                techsArray,
                location)
    
            // filtrar as conexções que estão há no mx 10km de distÂncia 
            // e que o novo dev tenha pelo menos uma das techs
            //const sendSocketMessageTo = findConnections({ latitude, longitude }, techsArray);
        }
    
        return res.json(dev);
    },

    async update(req, res) {
        //nome avatar bio localização tecnologias
        const { id } = req.params;
        const { name, longitude, latitude, techs, bio } = req.body;

        const techsArray = parseStringAsArray(techs);
        const location = pinPointLocation(longitude, latitude);
        const dev = await updateDevData(id, name, bio, techsArray, location);

        return res.json(dev);
    },

    async destroy(req, res) {
        const { id } = req.params;
        const devExists = await findDevToDelete(id)
        const result = devExists ? { message: `O usuário ${devExists.name} foi removido com sucesso!` } : { message: 'Usuário não encontrado!' }
    
        if (devExists) {
          await deleteDev(id)
        }
    
        return res.json(result)
    }

};
