import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { StockManagement } from '../schemas/stock-management.schema';
import { StockTransaction } from '../schemas/stock-transaction.schema';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { UpdateStockTransactionDto } from './dto/update-stock-transaction.dto';

@Injectable()
export class StockManagementService {
  constructor(
    @InjectModel(StockManagement.name)
    private stockItemModel: Model<StockManagement>,

    @InjectModel(StockTransaction.name)
    private stockTransactionModel: Model<StockTransaction>,
  ) { }

  // 🔹 Create Stock Item
  async createStockItem(dto: CreateStockItemDto): Promise<StockManagement> {
    const item = new this.stockItemModel(dto);
    return item.save();
  }

  // 🔹 Get All Stock Items (with filters)
  async getAllStockItems(filters: any): Promise<any[]> {
    const match: any = { isDeleted: { $ne: true } };

    if (filters.companyName) {
      match.companyName = { $regex: filters.companyName, $options: 'i' };
    }

    if (filters.itemName) {
      match.itemName = { $regex: filters.itemName, $options: 'i' };
    }

    return this.stockItemModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'stocktransactions',
          localField: '_id',
          foreignField: 'stockItemId',
          as: 'transactions',
        },
      },
      {
        $addFields: {
          quantity: {
            $sum: {
              $map: {
                input: '$transactions',
                as: 'txn',
                in: {
                  $cond: [
                    { $eq: ['$$txn.type', 'IN'] },
                    '$$txn.quantity',
                    { $multiply: ['$$txn.quantity', -1] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          transactions: 0,
          isDeleted: 0,
          isActive: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async getDashboardStatistics() {
    const totalResult = await this.stockTransactionModel.aggregate([
      {
        $group: {
          _id: null,
          totalInQuantity: {
            $sum: {
              $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0],
            },
          },
          totalOutQuantity: {
            $sum: {
              $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalInQuantity: 1,
          totalOutQuantity: 1,
        },
      },
    ]);

    const totals = totalResult[0] || { totalInQuantity: 0, totalOutQuantity: 0 };

    const remainingStock = await this.stockTransactionModel.aggregate([
      {
        $lookup: {
          from: 'stockmanagements',
          localField: 'stockItemId',
          foreignField: '_id',
          as: 'stockItem',
        },
      },
      { $unwind: '$stockItem' },
      {
        $group: {
          _id: '$stockItem._id',
          itemName: { $first: '$stockItem.itemName' },
          companyName: { $first: '$stockItem.companyName' },
          totalInQuantity: {
            $sum: {
              $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0],
            },
          },
          totalOutQuantity: {
            $sum: {
              $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          itemName: 1,
          companyName: 1,
          balanceQuantity: { $subtract: ['$totalInQuantity', '$totalOutQuantity'] },
        },
      },
      {
        $sort: { itemName: 1 },
      },
    ]);

    return {
      totalInQuantity: totals.totalInQuantity,
      totalOutQuantity: totals.totalOutQuantity,
      remainingStock,
    };
  }


  // 🔹 Get Stock By ID
  async getStockById(id: string): Promise<StockManagement | null> {
    return this.stockItemModel.findById(id).exec();
  }

  // 🔹 Update Stock Item
  async updateStockItem(id: string, dto: UpdateStockItemDto): Promise<StockManagement | null> {
    return this.stockItemModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  // 🔹 Soft Delete Stock Item
  async deleteStockItem(id: string): Promise<{ message: string }> {
    const stock = await this.stockItemModel.findByIdAndUpdate(
      id,
      { isActive: false, isDeleted: true },
      { new: true },
    );

    if (!stock) {
      throw new NotFoundException('Stock item not found');
    }

    return { message: 'Stock item deleted successfully' };
  }

  // 🔹 Create Stock Transaction
  async createStockTransaction(
    stockItemId: string,
    createStockDto,
  ): Promise<StockTransaction> {
    const stock = await this.stockItemModel.findById(stockItemId);
    if (!stock) throw new NotFoundException('Stock item not found');

    const transaction = new this.stockTransactionModel({
      stockItemId,
      ...createStockDto,
    });

    return transaction.save();
  }

  async updateStockTransaction(id: string, updateStockDto: UpdateStockTransactionDto) {
    const transaction = await this.stockTransactionModel.findByIdAndUpdate(id, updateStockDto, {
      new: true,
      runValidators: true,
    });

    if (!transaction) {
      throw new NotFoundException('Stock transaction not found');
    }

    return transaction;
  }

  // 🔹 Get Transactions By Stock Item ID

  // Old code

  // async getTransactionsByStock(
  //   stockItemId: string,
  //   companyName?: string,
  // ): Promise<any[]> {
  //   const stockItem = await this.stockItemModel.findById(stockItemId).lean();

  //   if (!stockItem) throw new NotFoundException('Stock item not found');

  //   if (companyName && stockItem.companyName.toLowerCase() !== companyName.toLowerCase()) {
  //     throw new NotFoundException('No stock item found for the given company name');
  //   }

  //   return this.stockTransactionModel.aggregate([
  //     {
  //       $match: { stockItemId: new Types.ObjectId(stockItemId) }
  //     },
  //     {
  //       $addFields: {
  //         dateOnly: {
  //           $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
  //         }
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: '$dateOnly',
  //         inQuantity: {
  //           $sum: {
  //             $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0]
  //           }
  //         },
  //         outQuantity: {
  //           $sum: {
  //             $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0]
  //           }
  //         }
  //       }
  //     },
  //     {
  //       $sort: { _id: 1 }
  //     },
  //     {
  //       $project: {
  //         date: '$_id',
  //         inQuantity: 1,
  //         outQuantity: 1,
  //         _id: 0
  //       }
  //     }
  //   ]).then((result) => {
  //     let balanceQuantity = 0;
  //     return result.map((entry) => {
  //       balanceQuantity += (entry.inQuantity || 0) - (entry.outQuantity || 0);
  //       return {
  //         companyName: stockItem.companyName,
  //         itemName: stockItem.itemName,
  //         itemCode: stockItem.itemCode,
  //         date: entry.date,
  //         inQuantity: entry.inQuantity,
  //         outQuantity: entry.outQuantity,
  //         balanceQuantity
  //       };
  //     });
  //   });
  // }

  // New code
  async getTransactionsByStock(
    stockItemId: string,
    companyName?: string,
  ): Promise<any[]> {
    // 1.  Make sure the stock item exists
    const stockItem = await this.stockItemModel.findById(stockItemId).lean();
    if (!stockItem) throw new NotFoundException('Stock item not found');

    // 2.  Optional company-name guard
    if (
      companyName &&
      stockItem.companyName.toLowerCase() !== companyName.toLowerCase()
    ) {
      throw new NotFoundException(
        'No stock item found for the given company name',
      );
    }

    // 3.  Pull every transaction for this item, oldest → newest
    const txns = await this.stockTransactionModel
      .aggregate([
        { $match: { stockItemId: new Types.ObjectId(stockItemId) } },

        // order is important so the running balance comes out right
        { $sort: { createdAt: 1 } },

        // shape each document
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            inQuantity: {
              $cond: [{ $eq: ['$type', 'IN'] }, '$quantity', 0],
            },
            outQuantity: {
              $cond: [{ $eq: ['$type', 'OUT'] }, '$quantity', 0],
            },
          },
        },
      ])
      .exec();

    // 4.  Calculate running balance on the Node side
    let balanceQuantity = 0;
    return txns.map((t) => {
      balanceQuantity += (t.inQuantity || 0) - (t.outQuantity || 0);
      return {
        companyName: stockItem.companyName,
        itemName: stockItem.itemName,
        itemCode: stockItem.itemCode,
        date: t.date,
        inQuantity: t.inQuantity,
        outQuantity: t.outQuantity,
        balanceQuantity,
      };
    });
  }

  // 🔹 Upload Stock Excel Data
  async bulkImportStockItems(sheetData: any[]): Promise<{ message: string; count: number }> {
    if (!sheetData || sheetData.length === 0) {
      throw new BadRequestException('Excel file contains no data');
    }

    const stockData = sheetData.map((row) => ({
      companyName: row.companyName,
      itemName: row.itemName,
      itemCode: row.itemCode,
      unit: row.unit,
    })) as CreateStockItemDto[];

    const result = await this.stockItemModel.insertMany(stockData);
    return { message: 'Stock items imported successfully', count: result.length };
  }
}