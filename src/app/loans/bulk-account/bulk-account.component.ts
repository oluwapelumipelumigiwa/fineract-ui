import { Component, OnInit, AfterViewInit, Input } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import { ClientsService } from "app/clients/clients.service";
import { SettingsService } from "app/settings/settings.service";
import { Dates } from 'app/core/utils/dates';
import { LoansService } from '../../loans/loans.service';

@Component({
  selector: "mifosx-bulk-account",
  templateUrl: "./bulk-account.component.html",
  styleUrls: ["./bulk-account.component.scss"],
})
export class BulkAccountComponent implements OnInit, AfterViewInit {
  // DECLARED VARIABLES
  /** bulkLoan form. */
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  bulkLoanForm: UntypedFormGroup;
  productData: any;
  loanOfficerData: any;
  fundData:any;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2100, 0, 1);
  clientsData: any = [];
  clientChoice = new UntypedFormControl('');
  clientMembers: any[] = [];
  officeData: any;
  /** Group's Client Members */
  groupClientMembers: any;
  /** Columns to be Displayed for client members table */
  clientMemberColumns: string[] = ['Id', 'Name', 'Purpose', 'Loan Amount'];
  /** Loans Account Details Form */
  loansAccountDetailsForm: UntypedFormGroup;
  /** Loan Purpose Options */
  loanPurposeOptions: any;
  loanPurposeData: any;
  loansAccountTemplateData: any;
  loanProductSelected = false;

  /**
   * Sets loans account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {SettingsService} settingsService SettingsService
   */

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    private loansService: LoansService,
    private dateUtils: Dates,
  ) {
    this.route.data.subscribe((data: {loansAccountTemplate:any,groupClientMembers: any }) => {
      console.log(data);
      this.loansAccountTemplateData = data.loansAccountTemplate;
      this.productData = this.loansAccountTemplateData.productOptions
      this.loanOfficerData = this.loansAccountTemplateData.loanOfficerOptions 
    });
    this.route.parent.data.subscribe((data: { groupViewData: any }) => {
      this.groupClientMembers = data.groupViewData.clientMembers;
    });
    this.route.data.subscribe( (data: {offices: any} ) => {
      this.officeData = data.offices;
    });
    this.setBulkLoanForm();
    this.createLoansAccountDetailsForm();
    this.buildDependencies();
    console.log("Loan Purpose Option")
    console.log(this.loanPurposeOptions);
  }
  ngOnInit(): void {    
    console.log("this is bulk loan accounts");
    console.log(this.loansAccountTemplate);
  }

  onSelectProduct(productObj: any){
    this.setTemplate(productObj)
  }

  setTemplate(productObj: any) {
    const entityId =(this.loansAccountTemplateData.clientId) ? this.loansAccountTemplateData.clientId : this.loansAccountTemplateData.group.id;
    const isGroup =(this.loansAccountTemplateData.clientId) ? false : true;
    const productId = productObj.id;
    this.loansService.getLoansAccountTemplateResource(entityId, isGroup, productId).subscribe((response: any) => {
        // console.log(response);
      this.fundData = response.fundOptions
      this.loanPurposeData = response.loanPurposeOptions
      this.loanProductSelected = true;
    });
  }

  /**
   * Creates loans account details form.
   */
  createLoansAccountDetailsForm() {
    this.loansAccountDetailsForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'loanOfficerId': [''],
      'loanPurposeId': [''],
      'fundId': [''],
      'submittedOnDate': [this.settingsService.businessDate, Validators.required],
      'expectedDisbursementDate': ['', Validators.required],
      'externalId': [''],
      'linkAccountId': [''],
      'createStandingInstructionAtDisbursement': ['']
    });
  }

  /**
   * Fetches loans account product template on productId value changes
   */
  buildDependencies() {
    //const entityId = (this.loansAccountTemplate.clientId) ? this.loansAccountTemplate.clientId : this.loansAccountTemplate.group.id;
    //const isGroup = (this.loansAccountTemplate.clientId) ? false : true;
    const entityId = 4;
    const isGroup = false;
    this.loansAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.loansService.getLoansAccountTemplateResource(entityId, isGroup, productId).subscribe((response: any) => {
        this.loanPurposeOptions = response.loanPurposeOptions;
      });
    });
    
  }

  setBulkLoanForm(){
    this.bulkLoanForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'loanOfficerId': [''],
      'fundId': [''],
      'submittedOnDate': [new Date(), Validators.required],
      'expectedDisbursementDate': [new Date(), Validators.required],
      'officeId': ['', Validators.required],
    })
  }

   /**
   * Subscribes to Clients search filter:
   */
   ngAfterViewInit() {
    
    this.clientChoice.valueChanges.subscribe( (value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value, this.bulkLoanForm.get('officeId').value)
        .subscribe( (data: any) => {
          this.clientsData = data.pageItems;
        });
      }
    });
    
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  /**
   * Add client.
   */
  addClient() {
    if (!this.clientMembers.includes(this.clientChoice.value)) {
      this.clientMembers.push(this.clientChoice.value);
    }
  }

  /**
   * Remove client.
   * @param index Client's array index.
   */
  removeClient(index: number) {
    this.clientMembers.splice(index, 1);
  }

  submit() {
    console.log(this.clientMembers);return
    
    const bulkLoanFormData = this.bulkLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const submittedOnDate: Date = this.bulkLoanForm.value.submittedOnDate;
    const expectedDisbursementDate: Date = this.bulkLoanForm.value.expectedDisbursementDate;
    if (bulkLoanFormData.submittedOnDate instanceof Date) {
      bulkLoanFormData.submittedOnDate = this.dateUtils.formatDate(submittedOnDate, dateFormat);
    }
    if (bulkLoanFormData.expectedDisbursementDate instanceof Date) {
      bulkLoanFormData.expectedDisbursementDate = this.dateUtils.formatDate(expectedDisbursementDate, dateFormat);
    }
    const data = {
      ...bulkLoanFormData,
      dateFormat,
      locale
    };

    data.clientMembers = [];
    this.clientMembers.forEach((client: any) => data.clientMembers.push(client.id));

    console.log(data);
    
    
    // data.clientMembers = [];
    // this.clientMembers.forEach((client: any) => data.clientMembers.push(client.id));
    // this.groupService.createGroup(data).subscribe((response: any) => {
    //   this.router.navigate(['../groups', response.resourceId, 'general']);
    // });
  }
}
