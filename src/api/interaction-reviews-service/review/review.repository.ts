import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "./schemas/review.schema";
import { Model } from "mongoose";

@Injectable()
export class ReviewRepository {
    constructor(
        @InjectModel(Review.name) private reviewRepository: Model<Review>
    ) { }
    
}