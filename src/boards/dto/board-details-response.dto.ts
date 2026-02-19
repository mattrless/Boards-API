import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BoardOwnerResponseDto } from './board-owner-response.dto';
import { ListSummaryResponseDto } from 'src/lists/dto/list-summary-response.dto';
import { CardSummaryResponseDto } from 'src/cards/dto/card-summary-response.dto';
import { CardMemberResponseDto } from 'src/cards/dto/card-members-response.dto';

export class BoardDetailsCardResponseDto extends CardSummaryResponseDto {
  @ApiProperty({ type: () => [CardMemberResponseDto] })
  @Expose()
  @Type(() => CardMemberResponseDto)
  members: CardMemberResponseDto[];
}

export class BoardDetailsListResponseDto extends ListSummaryResponseDto {
  @ApiProperty({ type: () => [BoardDetailsCardResponseDto] })
  @Expose()
  @Type(() => BoardDetailsCardResponseDto)
  cards: BoardDetailsCardResponseDto[];
}

export class BoardDetailsResponseDto extends BoardOwnerResponseDto {
  @ApiProperty({ type: () => [BoardDetailsListResponseDto] })
  @Expose()
  @Type(() => BoardDetailsListResponseDto)
  lists: BoardDetailsListResponseDto[];
}
