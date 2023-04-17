<style scoped>
    .about-box {
        height: 200px;
        text-align: center;
        padding: 60px 20px;
    }

    .subtitle {
        font-size: 18px;
        color: #333;
        font-weight: bold;
        text-align: left;
    }

    .desc {
        text-align: left;
        font-size: 13px;
        margin-top: 20px;
        color: #666;
    }

    .copyright {
        margin-top: 40px;
        font-size: 12px;
        color: #999;
    }

    .about-wrap {
        display: flex;
        align-items: center;
    }

    .logo-box {
        width: 180px;
        text-align: center;
    }

    .about-box {
        flex: 1;
    }
</style>

<template>
    <Modal
        ref="dialog"
        v-model="showDialog"
        :closable="true"
        :mask-closable="false"
        :footer-hide="true"
        :loading="false"
        :title="$t('关于')"
        width="600">
        <div class="about-wrap">
            <div class="logo-box">
                <img class="head-logo" src="/image/logo.png" />
            </div>
            <div class="about-box">
                <div class="subtitle">{{$t('协作化办公管理系统')}}</div>
            </div>
        </div>

    </Modal>
</template>


<script>
    export default {
        mixins: [componentMixin],
        data() {
            return {
                appVersion: '',
                releaseVersion: '',
                currentYear: '',
            };
        },
        methods: {
            pageLoad() {
                this.currentYear = new Date().getFullYear();
                // this.appVersion = app.version;
                this.releaseVersion = process.env.VUE_APP_RELEASE_VERSION;
                this.loadVersion();
                this.loadBuildVersion();
            },
            loadBuildVersion() {
                ajaxInvoke( '/p/main/', 'buildVersion', [], (t) => {
                        console.log(t)
                        if (t) {
                            this.releaseVersion = t.biz + "." + process.env.VUE_APP_RELEASE_VERSION;
                        } else {
                            this.releaseVersion = process.env.VUE_APP_RELEASE_VERSION;
                        }
                    },
                    (code, msg) => {
                        console.error(code,msg)
                    },
                );
            },
            loadVersion() {
                app.invoke('BizAction.getSystemConfig', [app.token], result => {
                    this.appVersion = result.appVersion;
                });
            },
        },
    };
</script>
