let passport = require('koa-passport')
const jwt = require('jsonwebtoken'); // аутентификация по JWT для hhtp

const jwtsecret = require('../config.js').jwtsecret

module.exports = {
	async login(ctx, next) {

		await passport.authenticate('local', function(err, user, info) {
			if (err)
				ctx.throw(err);
			if (user) {

				const payload={
					email: user.email,
					_id: user._id,
				}


				 const token = jwt.sign(payload, jwtsecret); //здесь создается JWT

				 ctx.body = {
					 email: user.email,
					 token:token,
					 _id: user._id
				 };
			} else {
				if (info) {
					ctx.body = {
						status: 404,
						result: info
					};
				}
				return ctx;
			}
		})(ctx, next)
	},
	async loginjwt(ctx, next) {
		await	passport.authenticate('jwt', function (err, user, info){
			if(err){
				ctx.throw(err)
			}
			if(user){
				ctx.body = {
					status: 200,
					result: 'success'
				};
			}
		})(ctx,next)
	}
}