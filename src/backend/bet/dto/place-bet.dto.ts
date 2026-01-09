import { IsArray, IsNumber, IsString, IsNotEmpty, Min, Max, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlaceBetDto {
  @ApiProperty({ example: 'op-1', description: 'Operator identifier' })
  @IsString()
  @IsNotEmpty()
  operatorId: string;

  @ApiProperty({ example: 'player-123', description: 'Player identifier' })
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 10.0, description: 'Bet stake amount', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  stake: number;

  @ApiProperty({ 
    example: [1, 2, 3, 4, 5], 
    description: 'Selected numbers (1-10 numbers, range 1-80)',
    type: [Number],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(80, { each: true })
  selections: number[];
}
