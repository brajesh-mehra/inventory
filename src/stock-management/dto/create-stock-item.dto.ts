import { IsString, IsOptional, IsNotEmpty, IsDefined } from 'class-validator';

export class CreateStockItemDto {
  @IsDefined({ message: 'Company name is required' })
  @IsNotEmpty({ message: 'Company name cannot be empty' })
  @IsString({ message: 'Company name must be a valid string' })
  companyName: string;

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

  @IsOptional()
  isActive?: boolean;
}