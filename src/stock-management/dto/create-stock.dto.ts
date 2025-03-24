import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNotEmpty, IsDefined, IsNumber } from 'class-validator';

export class CreateStockDto {
    @IsDefined({ message: 'CP Name is required' })
    @IsNotEmpty({ message: 'CP Name cannot be empty' })
    @IsString({ message: 'CP Name must be a valid string' })
    cpName: string;
  
    @IsDefined({ message: 'Item name is required' })
    @IsNotEmpty({ message: 'Item name cannot be empty' })
    @IsString({ message: 'Item name must be a valid string' })
    itemName: string;
  
    @IsDefined({ message: 'Item code is required' })
    @IsNotEmpty({ message: 'Item code cannot be empty' })
    @IsString({ message: 'Item code must be a valid string' })
    itemCode: string;

    @IsDefined({ message: 'Unit is required' })
    @IsNotEmpty({ message: 'Unit cannot be empty' })
    @IsString({ message: 'Unit must be a valid string' })
    unit: string;
  
    @IsDefined({ message: 'Quantity is required' }) 
    @IsNotEmpty({ message: 'Quantity cannot be empty' }) 
    @IsNumber({}, { message: 'Quantity must be a number' }) 
    @Type(() => Number) 
    quantity: number;
  
    @IsOptional()
    isActive?: boolean;
}
