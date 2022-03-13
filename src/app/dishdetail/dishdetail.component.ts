import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  @ViewChild('cform') commentFormDirective;
  
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  
  commentForm: FormGroup;
  newcomment: Comment;
  
  formErrors = {
    'author': '',
    'comment': '',
    'rating': ''
  };

  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Comment is required.'
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,private fb: FormBuilder) { 
		this.createForm();
	}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.dishservice.getDish(String(id)).subscribe(dish=>this.dish =dish);
	this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  goBack(): void {
    this.location.back();
  }
  
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  
  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      comment: ['', [Validators.required] ],
      rating: '',
	  date:new Date();
    });
	this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
	
  }

  onSubmit() {
    this.newcomment = this.commentForm.value;
    console.log(this.newcomment);
	console.log(this.dish.comments.push(this.newcomment));
    this.commentForm.reset({
      'author': '',
	  'comment': '',
      'rating': ''
    });
	
    this.commentFormDirective.resetForm();
	
  }
  
  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
}
