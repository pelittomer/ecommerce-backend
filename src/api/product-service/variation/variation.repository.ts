import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Variation } from "./schemas/variation.schema";
import { VariationOption } from "./schemas/variation-option.schema";
import { Model, Types } from "mongoose";
import { CreateVariationDto } from "./dto/create-variation.dto";
import { SharedUtilsService } from "src/common/utils/shared-utils.service";

@Injectable()
export class VariationRepository {
    constructor(
        @InjectModel(Variation.name) private variationModel: Model<Variation>,
        @InjectModel(VariationOption.name) private variationOptionModel: Model<VariationOption>,
        private readonly sharedUtilsService: SharedUtilsService
    ) { }

    async create(userInputs: CreateVariationDto) {
        await this.sharedUtilsService.executeTransaction(async (session) => {
            const [newVariation] = await this.variationModel.create([{
                name: userInputs.name,
                category: userInputs.category
            }], { session })
            const variationOptions = userInputs.options.map(option => ({
                name: option,
                variation: newVariation._id
            }))
            await this.variationOptionModel.insertMany(variationOptions, { session })
        })
    }

    async find(categoryId: Types.ObjectId) {
        return this.variationModel.aggregate([
            {
                $match: {
                    $or: [
                        { category: categoryId },
                        { category: { $exists: false } },
                        { category: null }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: '_id',
                    foreignField: 'variation',
                    as: 'options'
                }
            },
            { $sort: { name: 1 } },
            { $project: { name: 1, options: 1 } }
        ])
    }
}