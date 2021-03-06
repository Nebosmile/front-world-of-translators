const battleSchema = require('../../schemas/game/battle.js');
const CreatureSchema = require('../../schemas/game/creature.js');
const CharacterSchema = require('../../schemas/game/characters.js');
const PlaceSchema = require('../../schemas/game/place.js');
const WordSchema = require('../../schemas/word.js');
const mongoose = require('mongoose');
const fs = require('fs');

function 	randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

module.exports={
	async initbattle(socket, obj){ //obj._id
			var playerchar = await CharacterSchema.findOne({'_id':obj.player._id});
			var creature = await CreatureSchema.find({});
			var rand = randomInteger(0, creature.length-1);
			var rund_creature=creature[rand];

			var place = await PlaceSchema.findOne({'_id': obj.place})
            console.log(place);

            var creature_obj_arr = place.creatures.map(returnObjId)
            var words_obj_arr = place.words.map(returnObjId)

            var creature_list = await CreatureSchema.find({_id:{ $in: creature_obj_arr}})
            var words_list = await WordSchema.find({_id:{ $in: words_obj_arr}})

            console.log(' creature list is'+ creature_list);
            console.log(' words list is'+ words_list);

			var randword = await this.get_random_word(words_list);

			playerchar=playerchar.toObject();
			rund_creature=rund_creature.toObject();

			playerchar.activ_life = playerchar.base_stamina;
			rund_creature.activ_life = rund_creature.base_stamina;
			var newobj ={
				location:obj.place,
				players:[playerchar],
				creature:rund_creature,
				battleType:'creature', // creature, boss, duel
                wordsList:words_list,
                activeWord:randword,
			}

			var addBattle = new battleSchema(newobj)
			try{
				var saveBattle= await addBattle.save((err,result)=>{
					socket.emit('battleInited',{
						status: '200',
						result: result
					})
				})
				setTimeout(()=>{
					ai_atack(socket,saveBattle.id);
				},1000)


			}catch(err){
				console.log(err);
			}

	},
	async conectbattle(socket, obj){

	},
	async get_random_word(arr,last){
			var newword;

            function return_unique() {
                var rand = randomInteger(0, arr.length-1);
                newword = arr[rand];
                if(last){
                    if(arr[rand].english==last.english){
                        console.log('dublicate');
                        return_unique();
                    }
                }

            }
            return_unique()
			return newword;

	},
	async kick(socket, obj){
        console.log('kicked');
		var target_schema =  await battleSchema.findById(obj.battleObj._id);
		if(!target_schema || obj.word!=target_schema.activeWord.english){
            console.log('errrrrrr');
			socket.emit('kick_result',{
				status:'404',
				result:'not found'
			})
			return
		}
		var targetobj=target_schema.toObject();
        var randword = await this.get_random_word(targetobj.wordsList,targetobj.activeWord);
        targetobj.activeWord=randword;
		var kick_result=  atackCalc(targetobj.players[0],targetobj.creature)
		// targetobj.creature.activ_life -= targetobj.players[0].base_strength;


		var up_shema= await target_schema.set(targetobj).save();
		up_shema = up_shema.toObject();


		var status= check_life(up_shema)

		var battleobj={
			battleResult:status,
			battleState:up_shema
		}
		// console.log(up_shema);
		socket.emit('upword',{
			status:'200',
			result:battleobj
		})


	},

}
async function makebattlesession(player, creature) {

}
function returnObjId(item){
    return new mongoose.Types.ObjectId(item);
}

function check_life(battle_state){
	var result='';
	if(battle_state.creature.activ_life<=0){
		result = 'victory'
	}else if(battle_state.players[0].activ_life<=0){
		result = 'lose'
	}
	return result;
}
function atackCalc(triger,target){

	var kickobj={
		'triger':{
			ability:'kick',
			kicksize:''
		},
		'_target':{
			ability:false
		}
	}

	var ckeckcrit=critCalc(triger.base_strength)

	if(ckeckcrit){
		kickobj.triger.ability='crit';
	}
	kickobj.triger.kicksize=(triger.base_strength + triger.base_strength*ckeckcrit)
	target.activ_life -= kickobj.triger.kicksize;
	return kickobj;
}
function critCalc(chance){
	var iscrit = randomInteger(1,100)
	if(iscrit<=chance){
		return 1;
	}else{
		return 0;
	}
}

function randomInteger(min, max) {
	var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}
async function ai_atack(socket, id){
	try{
		var target_schema =  await battleSchema.findById(id);
		if(!target_schema){
			socket.emit('kick_result',{
				status:'404',
				result:'not found'
			})
			return
		}
		if(Number(target_schema.players[0].activ_life) > 0 && Number(target_schema.creature.activ_life)>0){
			var targetobj=target_schema.toObject();
			var kick_result=  atackCalc(targetobj.creature,targetobj.players[0])
			var up_shema= await target_schema.set(targetobj).save();
			// console.log(up_shema.players[0].activ_life);
			// console.log(up_shema.creature.activ_life);
			up_shema = up_shema.toObject();

			up_shema.players[0].kick_result=kick_result._target
			up_shema.creature.kick_result=kick_result.triger

			var status= check_life(up_shema)

			var battleobj={
				battleResult:status,
				battleState:up_shema
			}

			socket.emit('kicked',{
				status:'200',
				result:battleobj
			})
			if(Number(up_shema.players[0].activ_life) > 0 && Number(up_shema.creature.activ_life)>0){
				setTimeout(()=>{
						console.log('next kick');
						ai_atack(socket, id)
				},up_shema.creature.atack_speed*1000)
			}
		}

	}catch(e){
		console.log(e);
	}
}
