import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @IsNotEmpty()
  category: string; // e.g. "skills", "experience", "projects", "personal"

  @IsString()
  @IsNotEmpty()
  content: string; // the actual text to store and embed

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // any extra tags
}

export class UpdateKnowledgeDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  content?: string; // if updated, embedding will be regenerated

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
