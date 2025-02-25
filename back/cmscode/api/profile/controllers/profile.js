'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    async createMe(ctx) {
        try {
            const user = ctx.state.user;

            if (!user) {
                return ctx.badRequest(null, [{ messages: [{ id: 'Sem autorização. Usuário não encontrado.' }] }]);
            }

            // Criação do perfil usando o serviço de 'profile'
            const result = await strapi.services.profile.create({
                fullname: ctx.request.body.fullname,
                email: user.email,
                user: user.id,  // Relacionando o perfil com o usuário autenticado
            });

            return result;
        } catch (err) {
            return ctx.badRequest(null, [{ messages: [{ id: err.message }] }]);
        }
    },

    async findMe(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.badRequest(null, [{ messages: [{ id: "Sem autorização. Header não encontrado." }] }]);
        }

        // Encontra o perfil pelo ID do usuário
        const entity = await strapi.services.profile.findOne({ user: user.id });

        if (!entity) {
            return ctx.notFound('Profile not found');
        }

        // Retorna a entidade sanitizada
        return sanitizeEntity(entity, { model: strapi.models.profile });
    }
};