import { IsArray, IsNumber, IsString, IsNotEmpty, Min, Max, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  @IsNotEmpty()
  operatorId: string;

  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @Min(0.01)
  stake: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(80, { each: true })
  selections: number[];
}
