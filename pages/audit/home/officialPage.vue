<template>
  <div id="officialPage">
    <page-tool-bar
      :currentStatus="currentStatus"
      :currentIsDelete="form.isDelete"
      :currentCompontent="currentCompontent"
      :breadcrumbs="breadcrumbs"
    ></page-tool-bar>
    <div class="main-content">
      <v-form v-model="valid" ref="form">
        <!-- 連結設定 -->
        <v-card class="ma-5 pa-lg-5">
          <v-card-title>連結設定</v-card-title>
          <form-generate
            :labels="pageLabels"
            :dataSourceList="pageList"
            :disabled="disabled"
            enAction
          ></form-generate>
        </v-card>
      </v-form>

      <profile-dialog profileWidth="400px" ref="confirmDialog">
        <template #dialog-content>
          <div class="text-center">檔名已重複 : {{ confirmMessages }}</div>
          <div class="text-center">確認覆蓋?</div>
        </template>

        <template #dialog-close>
          <v-btn color="primary">取消</v-btn>
        </template>

        <template #dialog-save>
          <v-btn color="primary" @click="save">確認</v-btn>
        </template>
      </profile-dialog>

      <profile-dialog profileWidth="400px" ref="rejectDialog">
        <template #dialog-content>
          <div class="text-center">退件原因 :</div>
          <v-textarea outlined label v-model="rejectMessages"></v-textarea>
        </template>

        <template #dialog-close>
          <v-btn color="primary">取消</v-btn>
        </template>

        <template #dialog-save>
          <v-btn color="primary" @click="reject">確認</v-btn>
        </template>
      </profile-dialog>
    </div>
  </div>
</template>

<script>
import {
  caseEnum,
  officialPageLinkAreaEnum,
  officialPageHeaderLinkEnum,
  currentCaseStatusEnum,
} from "@/api/enum";
import Util from "@/util";
import previewUrl from "@/api/previewUrl";
import { pageLabels } from "@/api/share/head";
export default {
  layout: "audit/template",
  data: (vm) => ({
    currentCompontent: "agent1",
    breadcrumbs: [
      {
        text: "頁面連結管理",
        disabled: false,
        compontent: "officailPage",
        click: () => {
          vm.currentCompontent = "officailPage";
        },
      },
    ],

    collapseBln: true,
    dataSource: null,
    member: JSON.parse(window.sessionStorage.getItem("userInfo")),
    caseEnum: JSON.parse(JSON.stringify(caseEnum)),
    officialPageHeaderLinkEnum: officialPageHeaderLinkEnum,
    currentStatus: caseEnum.a,
    rejectMessages: "",
    confirmMessages: "",
    pageLabels: pageLabels,
    pageList: [],
    initLevelOne: {
      ydPageParentId: null,
      ydPageArea: officialPageLinkAreaEnum.m,
      bannerId: null,
      name: "",
      seq: "",
      link: "",
      hoverLink: "",
      cmDeptId: null,
      address: null,
      mapLink: null,
      serviceLine: null,
      serviceMail: null,
      socialLink: null,
      iconReq: null,
      level: 1,
      type: officialPageHeaderLinkEnum.u,
      levelTwo: [],
      childExpand: true,
      fileInput: {
        imageFile: [],
        imageStock: "",
        imageType: "stock",
      },
    },
    levelOne: [
      {
        ydPageArea: officialPageLinkAreaEnum.m,
        cmDeptId: null,
        address: null,
        mapLink: null,
        serviceLine: null,
        serviceMail: null,
        socialLink: null,
        iconReq: null,
        level: 1,
        name: "",
        seq: "",
        link: "",
        hoverLink: "",
        type: officialPageHeaderLinkEnum.u,
        levelTwo: [],
        childExpand: true,
        fileInput: {
          imageFile: [],
          imageStock: "",
          imageType: "stock",
        },
      },
    ],
    companyInfo: {
      ydPageArea: officialPageLinkAreaEnum.c,
      seq: 0,
      cmDeptId: null,
      level: 1,
      isDelete: caseEnum.n,
      ydPageInfoDTOMap: null,
      address: "",
      mapLink: "",
      serviceLine: "",
      serviceMail: "",
      socialLink: "",
      iconReq: null,
    },
    valid: true,
    disabled: false,
    form: {
      onTime: "",
      offTime: "",
      // onTime: dateUtil.formatDateFun("yyyy-MM-dd 00:00:00", new Date()),
      // offTime: dateUtil.formatDateFun("yyyy-MM-dd 23:59:00", new Date()),
      docReview: caseEnum.docReview_n,
      docReviewNo: null,
      isDelete: caseEnum.n,
      originalState: "",
      ydPageInfoDTOMap: null,
      stypeList: [],
      gtypeList: [],
      utypeList: [],
      ctypeList: [],
      mtypeList: [],
    },

    stockItems: [],
    bigCoverageList: [],
  }),
  computed: {
    currentPageAuth() {
      return this.$store.state.currentPageAuth;
    },
    currentCaseStatusText() {
      return currentCaseStatusEnum(this.currentStatus, this.form.isDelete);
    },
  },
  methods: {
    collapse() {
      this.collapseBln = !this.collapseBln;
      this.levelOne.map((ele) => {
        ele.childExpand = this.collapseBln;
        ele.levelTwo.map((sub) => (sub.childExpand = this.collapseBln));
        return ele;
      });
    },
    preview() {
      window.open(previewUrl.index + "/?preview=true", "_blank");
    },
    inputRejectMessage() {
      this.$refs.rejectDialog.toggle(true);
    },
    async reject() {
      this.$refs.rejectDialog.toggle(false);
      const res = await this.$store.dispatch("actionApi", {
        method: "delete",
        url: "api_page_info",
        params: { uid: "", message: this.rejectMessages },
      });

      if (res !== null && res !== undefined) {
        this.$store.dispatch("alert", "退件成功");
        await this.getData();
        await this.editData();
      }
    },
    async auditSuccess() {
      const res = await this.$store.dispatch("actionApi", {
        method: "put",
        url: "api_page_info",
        params: {
          uid: "",
          onTime: this.form.onTime,
          offTime: this.form.offTime,
        },
      });

      if (res !== null && res !== undefined) {
        this.$store.dispatch("alert", "審核成功");
        await this.getData();
        await this.editData();
      }
    },
    handleAddLevelOne() {
      if (this.levelOne.length < 9) {
        const newObj = JSON.parse(JSON.stringify(this.initLevelOne));
        this.levelOne.push(newObj);
      } else {
        this.$store.dispatch("alert", "最多可以有9個一階");
      }
    },
    handleRmLevelOne(index) {
      if (this.levelOne.length === 1) {
        this.$store.dispatch("alert", "無法刪除");
      } else {
        const newObj = JSON.parse(JSON.stringify(this.levelOne));
        newObj.splice(index, 1);
        this.levelOne = newObj;
      }
    },
    handleAddLevelTwo(index) {
      if (this.levelOne[index].levelTwo.length < 6) {
        const newObj = JSON.parse(JSON.stringify(this.initLevelTwo));
        this.levelOne[index].levelTwo.push(newObj);
      } else {
        this.$store.dispatch("alert", "最多可以有6個二階");
      }
    },
    handleRmLevelTwo(levelOneIndex, index) {
      const newObj = JSON.parse(
        JSON.stringify(this.levelOne[levelOneIndex].levelTwo)
      );
      newObj.splice(index, 1);
      this.levelOne[levelOneIndex].levelTwo = newObj;
    },
    handleAddLevelThr(level1Index, level2Index) {
      const level3 = this.levelOne[level1Index].levelTwo[level2Index].levelThr;
      if (level3.length < 13) {
        const newObj = JSON.parse(JSON.stringify(this.initLevelThr));
        this.levelOne[level1Index].levelTwo[level2Index].levelThr.push(newObj);
      } else {
        this.$store.dispatch("alert", "最多可以有12個三階");
      }
    },
    handleRmLevelThr(levelOneIndex, levelTwoIndex, index) {
      const newObj = JSON.parse(
        JSON.stringify(
          this.levelOne[levelOneIndex].levelTwo[levelTwoIndex].levelThr
        )
      );
      newObj.splice(index, 1);
      this.levelOne[levelOneIndex].levelTwo[levelTwoIndex].levelThr = newObj;
    },
    async checkSave(status) {
      let checkFile = [];
      let submit = {
        ydPageArea: "",
        seq: 0,
        hoverImage: null,
        hoverLink: null,
        link: "",
        cmDeptId: null,
        address: null,
        mapLink: null,
        serviceLine: null,
        serviceMail: null,
        socialLink: null,
        iconReq: null,
        level: 1,
        isDelete: caseEnum.n,
        ydPageInfoDTOMap: null,
      };
      try {
        if (!this.valid) {
          this.$refs.form.validate();
          throw "請檢查*為必填欄位";
        }

        let mtypeList = [];
        for (const ele of this.levelOne) {
          const image = await Util.imageCheck(
            checkFile,
            ele,
            "imageType",
            "imageFile",
            "imageStock"
          );
          if (!image) {
            throw "活動行銷圖需為圖檔";
          } else {
            const e = JSON.parse(JSON.stringify(ele));
            e.hoverReq = image;
            delete e.fileInput;
            e.pageDTOList = e.levelTwo.map((two) => {
              two.pageDTOList = two.levelThr.map((thr) => thr);
              delete two.levelThr;
              return two;
            });
            delete e.levelTwo;
            mtypeList.push(e);
          }
        }

        // 連結設定
        const stypeList = this.pageFooterList.map((ele) => {
          let s = JSON.parse(JSON.stringify(submit));
          const stype = Object.assign({}, s, ele);
          stype.ydPageArea = officialPageLinkAreaEnum.s;
          return stype;
        });
      } catch (e) {
        this.$store.dispatch("alert", e);
        return;
      }
    },
    save() {
      window.setTimeout(async () => {
        const res = await this.$store.dispatch("actionApi", {
          method: "post",
          url: "api_page_info",
          params: this.form,
        });
        if (res !== null && res !== undefined) {
          if (this.form.status === caseEnum.d) {
            this.$store.dispatch("alert", "儲存成功");
          } else {
            this.$store.dispatch("alert", "送出成功");
          }
          await this.getData();
          await this.editData();
        }
      }, 500);
    },
    editData() {
      if (this.dataSource !== null && this.dataSource !== undefined) {
        this.form.originalState = JSON.stringify(this.dataSource);
        let clone = JSON.parse(JSON.stringify(this.dataSource));
        this.form.status = clone.status;
        this.form.isDelete = clone.isDelete;
        this.form.docReview = Util.isBlank(clone.docReview)
          ? caseEnum.docReview_n
          : clone.docReview;
        this.form.docReviewNo = Util.isEmpty(clone.docReviewNo)
          ? ""
          : clone.docReviewNo;
        this.currentStatus = clone.status;
        if (clone.status === caseEnum.r || clone.status === caseEnum.a) {
          this.disabled = true;
        } else if (this.currentPageAuth.indexOf(this.caseEnum.a) !== -1) {
          this.disabled = true;
        } else {
          this.disabled = false;
        }

        // header link
        this.levelOne = clone.mtypeList.map((ele) => {
          let newOneObj = JSON.parse(JSON.stringify(this.initLevelOne));
          let one = Object.assign({}, newOneObj, ele);
          one.fileInput.imageStock = ele.hoverReq.fileName;

          if (ele.pageDTOList && ele.pageDTOList.length !== 0) {
            one.levelTwo = ele.pageDTOList.map((w) => {
              let newTwoObj = JSON.parse(JSON.stringify(this.initLevelTwo));
              let two = Object.assign({}, newTwoObj, w);
              if (w.pageDTOList && w.pageDTOList.length !== 0) {
                two.levelThr = w.pageDTOList.map((t) => {
                  let newThrObj = JSON.parse(JSON.stringify(this.initLevelThr));
                  let thr = Object.assign({}, newThrObj, t);
                  return thr;
                });
              }
              return two;
            });
          }
          return one;
        });
        // 連結設定
        this.pageFooterList = [];
        this.pageFooterList = clone.stypeList;
      }
    },
    async getResource() {
      const data = await this.$store.dispatch("getResource");
      this.stockItems = data;
    },
    async getBigCoverage() {
      const res = await this.$store.dispatch("actionApi", {
        method: "get",
        url: "api_bigCoverage_rest",
      });
      if (res !== null && res !== undefined) {
        this.bigCoverageList = [];
        this.bigCoverageList = res._embedded.aboutBigCoverages;
      }
    },
    async getData() {
      const res = await this.$store.dispatch("actionApi", {
        method: "get",
        url: "api_page_info",
      });
      this.dataSource = null;
      if (res !== null && res !== undefined) {
        this.dataSource = res;
      }
    },
  },
  async created() {
    // await this.getResource();
    // await this.getBigCoverage();
  },
  async mounted() {
    // await this.getData();
    // await this.editData();
    if (this.currentPageAuth.indexOf(this.caseEnum.a) !== -1) {
      this.disabled = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.officialPage {
  width: 100%;
}
</style>

