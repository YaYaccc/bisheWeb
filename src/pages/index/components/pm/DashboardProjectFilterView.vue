<style scoped>
   .menu-item-group{
        font-size:12px;
        color:#999;
         padding:8px 0px;
        margin-top:20px;
    }
    .filter-tag{
        font-size:13px;
        padding:3px 10px;
        background-color: #EEEEEE;
        color:#777;
        display: inline-block;
        margin-right: 10px;
        margin-top:10px;
        border-radius: 13px;
        cursor: pointer;
        user-select: none;
         max-width: 200px;
        text-overflow:ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .filter-count{
        font-size:12px;
        margin-left: 5px;
        font-weight: bold;
    }
    .filter-tag-select{
        background-color: #009CF1;
        color:#fff;
    }
</style>
<i18n>
{

}
</i18n>


<script>
export default {
    mixins: [componentMixin],
  
    data(){
        return {
            projectFilters:{
                dateType:null,
                starProject:false,
                group:null,
            },
            projectList:[],
            groupList:[],
        }
    },  
    mounted(){
        this.loadProjectData()
    },
    methods:{
        filteredProjectList(){
            var list=[];
            for(var i=0;i<this.projectList.length;i++){
                var t=this.projectList[i];
                if(this.projectFilters.group!=null){
                    if(t.group!=this.projectFilters.group){
                        continue;
                    }
                }
                if(this.projectFilters.dateType==1){
                    if(t.iteration.status==3){
                        continue;
                    }
                    if(t.iteration.endDate==null||getLeftDays(t.iteration.endDate)>=0){
                        continue;
                    }
                }
                if(this.projectFilters.dateType==2){
                    if(t.iteration.endDate==null||!dateSameWeek(new Date(t.iteration.endDate),new Date())){
                        continue;
                    }
                }
                if(this.projectFilters.dateType==3){
                    if(t.iteration.endDate==null||!dateSameDay(new Date(t.iteration.endDate),new Date())){
                        continue;
                    }
                }
                if(this.projectFilters.dateType==4){
                    if(t.iteration.endDate!=null){
                        continue;
                    }
                }
                if(this.projectFilters.starProject){        
                    if(t.star==false){
                        continue;
                    }
                }
                list.push(t);
            }
            return list;
        },
        setProjectDateFilter(value){
            if(this.projectFilters.dateType==value){
                this.projectFilters.dateType=null;
            }else{
                this.projectFilters.dateType=value;
            }
            this.$emit('list-changed',this.filteredProjectList())
        },
        toggleStar(){
            this.projectFilters.starProject=!this.projectFilters.starProject;
            this.$emit('list-changed',this.filteredProjectList())
        },
        toggleGroup(group){
            if(this.projectFilters.group==group){
                this.projectFilters.group=null;
            }else{
                this.projectFilters.group=group;
            }
            this.$emit('list-changed',this.filteredProjectList())
        },
        reloadData(){
            this.loadProjectData();
        },
        loadProjectData(){
            app.invoke("BizAction.getMyProjectList",[app.token],list => {
                var allGroupList=[];
                for(var i=0;i<list.length;i++){
                    var t=list[i];
                    if(t.activityCount){
                        t.activityCount=JSON.parse(t.activityCount);
                    }
                    if(t.group){
                        if(allGroupList[t.group]==null){
                            allGroupList[t.group]=true;
                            this.groupList.push(t.group);
                        }
                    }
                }
                this.projectList=list;
                //
                this.$emit('show-create',list.length==0)
                this.$emit('list-changed',this.filteredProjectList())
            });
        }
    }
}
</script>