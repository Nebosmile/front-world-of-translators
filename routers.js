const Router = require('koa-router');
const router = new Router();
const serve = require('koa-static');


const base_controller = require('./controlers/index');
const word_controller = require('./controlers/words_control');




router.get('/',base_controller.get_index);



router.post('/',base_controller.post_index)
router.post('/word',word_controller.save)



module.exports= router;
