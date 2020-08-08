<template>
    <div>
        <ui-button @confirm="onBtnClick">按钮</ui-button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'


    @Component({
        components: {}
    })
    export default class extends Vue {
        name: string = '';

        created() {
            console.log('hell app')
        }


        mounted() {

        }

        onBtnClick() {
            Editor.Ipc.sendToMain('ts-demo:clicked');
        }
    }

</script>

<style>

</style>
