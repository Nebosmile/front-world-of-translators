<template lang="html">
	<div class="">
		<div class="add">
			<router-link to='/adminpanel/place/add'>add new</router-link>
		</div>

		<input @click='search' type="button" name="" value="search">
		<tableindex @edit='edit_redirect' v-if='table.ansver' :options='table'></tableindex>
	</div>
</template>

<script>
import tableindex from '@/components/table/tableindex';


export default {
	layout:'base_page',
	components:{
		tableindex,
	},
	async asyncData(){
		return{
			table:{
				tableoption:{
					name:'Detailed info',

				},
				set_value:'',
				ansver:'',
				count:'',
				clickevent_tr: {
					callevent: 'add_user_to_list',
				},
				initvalue:[
					{value: 'counter', name:'Counter',status:'checked',default:'1'},
					{value:'_id', name:'ID',status:'checked',default:'1',
						// clickevent:{
						// 	callevent:'getrounds',
						// },
						button:{
							name:'edit',
							callevent:'edit',
						}
					},
					{value: 'name', name:'name',status:'checked',default:'1'},
					{value: 'creatures', name:'creatures',status:'checked',default:'1'},
					{value: 'words', name:'words',status:'checked',default:'1'},

				]
			},
		}
	},
	methods:{
		search(){
			$.ajax({
				url:'/admin/place/search',
				type:'POST',
				dataType:'json',
				success:(data)=> {
					console.log(data);
					this.table.ansver = data.result;
				}
			})
		},
		edit_redirect(obj){
			this.$router.push('/adminpanel/place/edit/'+obj._id)
			console.log(obj);
		}
	},
	mounted(){
		this.search()
	}
}
</script>

<style lang="css">
</style>
