<template lang="html">
  	<div class="">
        <div v-if='(state=="character")' class="chose_haracter">
            <h1>Chose character1</h1>
            <div class="char_list">
                <div v-for='item in character_list' class="character_wrap">
                    <div class="character" >
                        {{item.name}}
                    </div>
                    <input @click='choose_character(item)' type="button" name="" value="Choose">
                </div>
            </div>
        </div>
        <div v-if='(state=="place")' class="chose_plase">
            <h1>Chose place</h1>
            <div class="char_list">
                <div  v-for='item in place_list' class="character_wrap">
                    <div class="character" >
                        {{item.name}}
                    </div>
                    <input @click='choose_place(item)' type="button" name="" value="Choose">
                </div>
            </div>
        </div>

        <div v-if='(state=="battle")' >
            <div class="choosed_char">
                {{choosed_char.name}}
            </div>
            <button @click='init_battle()' type="button" name="button">start battle</button>
        </div>
        <div class="">
            <input type="button" @click='back' name="" value="back">

            <div class="" v-if='battle' >

                <div class="result">
                    {{battleResult}}
                </div>
                <div class="battle">
                    <div class="battle_info">
                        <div class="action">
                            <p v-if='user_char.kick_result'>
                                <span v-if='user_char.kick_result.ability'>
                                    {{user_char.kick_result.ability}}
                                </span>
                                <span>
                                    {{user_char.kick_result.kicksize}}
                                </span>
                            </p>

                            <!-- {{user_char.kick_result.ability}}; -->
                            <!-- {{user_char.kick_result.kicksize}} -->
                        </div>
                        <div class="life">
                            <div :style='{width: life_line(user_char)}' class="red_life"></div>
                            <p>{{user_char.activ_life}}</p>
                        </div>
                        <p>{{user_char.name}}</p>
                        <p @click='test_socket'>Test socket</p>
                        <div class="">
                            <battle :battleObj='battleObj' :socket='socket' @useratack='useratack'></battle>
                        </div>

                    </div>
                    <div class="battle_info">
                        <div class="action">
                            <p v-if='oponent.kick_result'>
                                <span v-if='oponent.kick_result.ability'>
                                    {{oponent.kick_result.ability}}
                                </span>
                                <span>
                                    {{oponent.kick_result.kicksize}}
                                </span>
                            </p>

                            <!-- {{oponent.kick_result.kicksize}}&lt;
                            {{oponent.kick_result.ability}} -->

                        </div>
                        <div class="life">
                            <div :style='{width: life_line(oponent)}' class="red_life">

                            </div>
                            <p>{{oponent.activ_life}}</p>
                        </div>
                        <p>{{oponent.name}}</p>
                        <!-- <input type="button" name="" value="atack"> -->
                    </div>
                </div>
            </div>

		</div>
  	</div>
</template>

<script>

import battle from '@/components/battle/battle.vue'

// var battle = new Battle({
//     translate_lang:'english'
// })
console.log(battle);
export default {
	layout:'base_page',
	components:{
		battle
	},
	data(){
		return{
            state:"character",  //"character", "place", "battle"
            chosed_place:'',
            place_list:'',
			character_list:'',
            creature_list:'',
            choosed_char:'',
			user_char:'',
			oponent:'',
			battle:false,
            active_battle:false,
            user_ansver:'',
            socket:'',
            battleObj:'',
            battleResult:'',
		}
	},
	methods:{
        test_socket(){
            this.socket = io('http://localhost:4000', { transports: ['websocket'], upgrade: false });
            this.socket.on('test',(message)=>{
                console.log(message);
                if (message.status=='200',message.result=='conected' ) {
                    console.log('socket is ready');

                }
            })
            this.socket.on('battleInited',(message)=>{
                console.log(message.result);
                if (message.status=='200') {
                    this.draw_battle(message.result);
                }
            })
            this.socket.on('kicked',(message)=>{
                console.log(message.result);

                if (message.status=='200') {
                    this.draw_battle(message.result.battleState);
                }
                if(message.result.battleResult!=''){
                    this.battleResult=message.result.battleResult;
                    return
                }

            })
            this.socket.on('upword',(message)=>{
                if (message.status=='200') {
                    this.draw_battle(message.result.battleState);
                }
                if(message.result.battleResult!=''){
                    this.battleResult=message.result.battleResult;
                    return
                }
                this.$emit('upword',message.result.battleState.activeWord)


            })
        },
        draw_battle(battleObj){
            console.log(battleObj);
            console.log('drawfunction');
            this.oponent=battleObj.creature
            this.user_char =battleObj.players[0];
            this.battleObj=battleObj;
            this.battle=true;
        },
        add_battle(){
            var newthis =this;
            var final_obj ={
                'player':this.choosed_char,
                'place':this.choosed_place._id,
            }
            this.socket.emit('initbattle', final_obj);
        },
        life_line(target){
            return (target.activ_life/ target.base_stamina)*100 +'%';
        },
        hit(source, target,callback){
            if(this.check_life()){
                this.active_battle=false;
                this.result();
                callback()
                return
            }
            target.activ_life = target.activ_life - source.base_strength;
            console.log(this.user_char.activ_life);

        },

        back(){
            this.battle=false;
        },
        get_creature_list(){
            return $.ajax({
                url:'/admin/creature/search',
                type:'POST',
                dataType:'json',
                // success:(data)=> {
                //     console.log(data.result);
                //     if(data.status='200'){
                //         this.creature_list=data.result
                //     }
                // }
            })
        },
        async choose_character(obj){
            this.choosed_char=obj;
            this.state='place';
        },
        choose_place(obj){
            this.choosed_place=obj;
            this.state='battle';
            console.log(obj);
        },
		async init_battle(){
            this.add_battle()

            // var get_character = await this.search_char(obj._id);

            return
		},
		randomInteger(min, max) {
		    var rand = min - 0.5 + Math.random() * (max - min + 1)
		    rand = Math.round(rand);
		    return rand;
		},
        getplace(){
            $.ajax({
				url:'/admin/place/search',
				type:'POST',
				dataType:'json',
				success:(data)=> {
					console.log(data.result);
					if(data.status='200'){
						this.place_list=data.result;
					}
				}
			})
        },

		search(){
			$.ajax({
				url:'/admin/characters/search',
				type:'POST',
				dataType:'json',
				success:(data)=> {
					console.log(data.result);
					if(data.status='200'){
						this.character_list=data.result
					}
				}
			})
		},
        async useratack(){
            this.hit(this.user_char,this.oponent);
        },

	},
	mounted(){
		this.search();
        this.getplace();
        this.test_socket();
	}
}
</script>

<style lang="scss">
.action{
    height: 15px;
    p{
        margin: 0;
    }
}
.battle{
    display: flex;
	width: 100%;
	.battle_info{
		width: 50%;
		.life{
            width: 80%;
            .red_life{
                background-color: red;
                min-height: 30px;
            }
		}
	}
}
.center{
    text-align: center;
}
.red_life{
    transition: width 0.3s linear;
}
.result{
    text-align: center;
    font-size: 40px;
    width: 100px;
    height: 50px;
    // border:1px solid;
    margin:10px auto;
    color: green;
}
.char_list{
	width: 100%;
    display: flex;
    margin-bottom: 10px;
	.character{
		display: inline-block;
		background-color: rgb(227, 225, 245);
		box-shadow: 0px 1px 1px 1px #000;
		cursor: pointer;
		border-radius: 5px;
		width: 100px;
		padding: 5px;
		margin: 5px;
        webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;
	}
}
.character_wrap{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.choosed_char{
    border: 1px solid #000;
    background-color: rgb(29, 209, 67)
}
</style>
