
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "achievements": {
                  Row: {
                    "code": string,"description": string,"icon": string,"id": number,"name": string,"xp_reward": number
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"description": string,"icon"?: string,"id"?: number,"name": string,"xp_reward"?: number
                  }
                  Update: {
                    "code"?: string,"description"?: string,"icon"?: string,"id"?: number,"name"?: string,"xp_reward"?: number
                  }
                  Relationships: [
                    
                  ]
                },"announcements": {
                  Row: {
                    "audience": string,"body": string,"class_id": string | null,"created_at": string,"created_by": string | null,"id": string,"published": boolean,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audience"?: string,"body": string,"class_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"published"?: boolean,"title": string
                  }
                  Update: {
                    "audience"?: string,"body"?: string,"class_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"published"?: boolean,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "announcements_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "announcements_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"assignments": {
                  Row: {
                    "class_id": string,"created_at": string,"created_by": string | null,"due_at": string | null,"id": string,"instructions": string | null,"package_id": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id": string,"created_at"?: string,"created_by"?: string | null,"due_at"?: string | null,"id"?: string,"instructions"?: string | null,"package_id": string,"title": string
                  }
                  Update: {
                    "class_id"?: string,"created_at"?: string,"created_by"?: string | null,"due_at"?: string | null,"id"?: string,"instructions"?: string | null,"package_id"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assignments_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assignments_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assignments_package_id_fkey"
      columns: ["package_id"]
isOneToOne: false
      referencedRelation: "quiz_packages"
      referencedColumns: ["id"]
    }
                  ]
                },"attempt_questions": {
                  Row: {
                    "attempt_id": string,"option_order": (string)[],"position": number,"question_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id": string,"option_order": (string)[],"position": number,"question_id": string
                  }
                  Update: {
                    "attempt_id"?: string,"option_order"?: (string)[],"position"?: number,"question_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attempt_questions_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "quiz_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempt_questions_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"classes": {
                  Row: {
                    "created_at": string,"created_by": string | null,"description": string | null,"id": string,"join_code": string,"name": string,"school_level": Database["public"]['Enums']["school_level"] | null,"teacher_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"id"?: string,"join_code"?: string,"name": string,"school_level"?: Database["public"]['Enums']["school_level"] | null,"teacher_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"id"?: string,"join_code"?: string,"name"?: string,"school_level"?: Database["public"]['Enums']["school_level"] | null,"teacher_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "classes_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "classes_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"enrollments": {
                  Row: {
                    "class_id": string,"joined_at": string,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id": string,"joined_at"?: string,"student_id": string
                  }
                  Update: {
                    "class_id"?: string,"joined_at"?: string,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "enrollments_class_id_fkey"
      columns: ["class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "enrollments_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "bio": string | null,"cefr_level": Database["public"]['Enums']["cefr_level"] | null,"cefr_placed_at": string | null,"created_at": string,"current_streak": number,"full_name": string,"grade": number | null,"id": string,"last_active_date": string | null,"longest_streak": number,"role": string,"school_level": Database["public"]['Enums']["school_level"] | null,"school_name": string | null,"updated_at": string,"xp": number
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"cefr_level"?: Database["public"]['Enums']["cefr_level"] | null,"cefr_placed_at"?: string | null,"created_at"?: string,"current_streak"?: number,"full_name"?: string,"grade"?: number | null,"id": string,"last_active_date"?: string | null,"longest_streak"?: number,"role"?: string,"school_level"?: Database["public"]['Enums']["school_level"] | null,"school_name"?: string | null,"updated_at"?: string,"xp"?: number
                  }
                  Update: {
                    "bio"?: string | null,"cefr_level"?: Database["public"]['Enums']["cefr_level"] | null,"cefr_placed_at"?: string | null,"created_at"?: string,"current_streak"?: number,"full_name"?: string,"grade"?: number | null,"id"?: string,"last_active_date"?: string | null,"longest_streak"?: number,"role"?: string,"school_level"?: Database["public"]['Enums']["school_level"] | null,"school_name"?: string | null,"updated_at"?: string,"xp"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_role_fkey"
      columns: ["role"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"question_categories": {
                  Row: {
                    "description": string | null,"id": number,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string | null,"id"?: number,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "description"?: string | null,"id"?: number,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"question_options": {
                  Row: {
                    "id": string,"is_correct": boolean,"label": string,"option_text": string,"question_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"is_correct"?: boolean,"label": string,"option_text": string,"question_id": string
                  }
                  Update: {
                    "id"?: string,"is_correct"?: boolean,"label"?: string,"option_text"?: string,"question_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "question_options_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"question_tags": {
                  Row: {
                    "question_id": string,"tag": string
                  }
                  ComputedFields: never
                  Insert: {
                    "question_id": string,"tag": string
                  }
                  Update: {
                    "question_id"?: string,"tag"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "question_tags_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"questions": {
                  Row: {
                    "category_id": number,"cefr_level": Database["public"]['Enums']["cefr_level"] | null,"code": string,"created_at": string,"created_by": string | null,"difficulty": Database["public"]['Enums']["difficulty_level"],"distractor_analysis": string | null,"explanation": string,"id": string,"learning_mode": Database["public"]['Enums']["learning_mode"],"learning_objective": string | null,"passage": string | null,"question_text": string,"school_level": Database["public"]['Enums']["school_level"] | null,"skill_assessed": string | null,"status": Database["public"]['Enums']["publication_status"],"subcategory": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": number,"cefr_level"?: Database["public"]['Enums']["cefr_level"] | null,"code"?: string,"created_at"?: string,"created_by"?: string | null,"difficulty"?: Database["public"]['Enums']["difficulty_level"],"distractor_analysis"?: string | null,"explanation"?: string,"id"?: string,"learning_mode": Database["public"]['Enums']["learning_mode"],"learning_objective"?: string | null,"passage"?: string | null,"question_text": string,"school_level"?: Database["public"]['Enums']["school_level"] | null,"skill_assessed"?: string | null,"status"?: Database["public"]['Enums']["publication_status"],"subcategory"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "category_id"?: number,"cefr_level"?: Database["public"]['Enums']["cefr_level"] | null,"code"?: string,"created_at"?: string,"created_by"?: string | null,"difficulty"?: Database["public"]['Enums']["difficulty_level"],"distractor_analysis"?: string | null,"explanation"?: string,"id"?: string,"learning_mode"?: Database["public"]['Enums']["learning_mode"],"learning_objective"?: string | null,"passage"?: string | null,"question_text"?: string,"school_level"?: Database["public"]['Enums']["school_level"] | null,"skill_assessed"?: string | null,"status"?: Database["public"]['Enums']["publication_status"],"subcategory"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "question_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "questions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_attempts": {
                  Row: {
                    "assessment_type": Database["public"]['Enums']["assessment_type"],"assignment_id": string | null,"category_id": number | null,"cefr_level": Database["public"]['Enums']["cefr_level"] | null,"correct_count": number | null,"expires_at": string | null,"id": string,"learning_mode": Database["public"]['Enums']["learning_mode"],"mode": Database["public"]['Enums']["quiz_mode"],"package_id": string | null,"passed": boolean | null,"passing_score": number,"placement_result": Database["public"]['Enums']["cefr_level"] | null,"school_level": Database["public"]['Enums']["school_level"] | null,"score": number | null,"started_at": string,"status": Database["public"]['Enums']["attempt_status"],"student_id": string,"submitted_at": string | null,"time_limit_minutes": number | null,"title": string,"total_questions": number,"xp_earned": number
                  }
                  ComputedFields: never
                  Insert: {
                    "assessment_type": Database["public"]['Enums']["assessment_type"],"assignment_id"?: string | null,"category_id"?: number | null,"cefr_level"?: Database["public"]['Enums']["cefr_level"] | null,"correct_count"?: number | null,"expires_at"?: string | null,"id"?: string,"learning_mode": Database["public"]['Enums']["learning_mode"],"mode": Database["public"]['Enums']["quiz_mode"],"package_id"?: string | null,"passed"?: boolean | null,"passing_score"?: number,"placement_result"?: Database["public"]['Enums']["cefr_level"] | null,"school_level"?: Database["public"]['Enums']["school_level"] | null,"score"?: number | null,"started_at"?: string,"status"?: Database["public"]['Enums']["attempt_status"],"student_id": string,"submitted_at"?: string | null,"time_limit_minutes"?: number | null,"title": string,"total_questions"?: number,"xp_earned"?: number
                  }
                  Update: {
                    "assessment_type"?: Database["public"]['Enums']["assessment_type"],"assignment_id"?: string | null,"category_id"?: number | null,"cefr_level"?: Database["public"]['Enums']["cefr_level"] | null,"correct_count"?: number | null,"expires_at"?: string | null,"id"?: string,"learning_mode"?: Database["public"]['Enums']["learning_mode"],"mode"?: Database["public"]['Enums']["quiz_mode"],"package_id"?: string | null,"passed"?: boolean | null,"passing_score"?: number,"placement_result"?: Database["public"]['Enums']["cefr_level"] | null,"school_level"?: Database["public"]['Enums']["school_level"] | null,"score"?: number | null,"started_at"?: string,"status"?: Database["public"]['Enums']["attempt_status"],"student_id"?: string,"submitted_at"?: string | null,"time_limit_minutes"?: number | null,"title"?: string,"total_questions"?: number,"xp_earned"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_attempts_assignment_id_fkey"
      columns: ["assignment_id"]
isOneToOne: false
      referencedRelation: "assignments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_attempts_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "question_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_attempts_package_id_fkey"
      columns: ["package_id"]
isOneToOne: false
      referencedRelation: "quiz_packages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_attempts_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_packages": {
                  Row: {
                    "assessment_type": Database["public"]['Enums']["assessment_type"],"category_id": number | null,"created_at": string,"created_by": string | null,"description": string | null,"id": string,"learning_mode": Database["public"]['Enums']["learning_mode"],"mode": Database["public"]['Enums']["quiz_mode"],"passing_score": number,"question_count": number,"school_level": Database["public"]['Enums']["school_level"] | null,"status": Database["public"]['Enums']["publication_status"],"target_cefr": Database["public"]['Enums']["cefr_level"] | null,"time_limit_minutes": number | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assessment_type": Database["public"]['Enums']["assessment_type"],"category_id"?: number | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"id"?: string,"learning_mode": Database["public"]['Enums']["learning_mode"],"mode"?: Database["public"]['Enums']["quiz_mode"],"passing_score"?: number,"question_count"?: number,"school_level"?: Database["public"]['Enums']["school_level"] | null,"status"?: Database["public"]['Enums']["publication_status"],"target_cefr"?: Database["public"]['Enums']["cefr_level"] | null,"time_limit_minutes"?: number | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "assessment_type"?: Database["public"]['Enums']["assessment_type"],"category_id"?: number | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"id"?: string,"learning_mode"?: Database["public"]['Enums']["learning_mode"],"mode"?: Database["public"]['Enums']["quiz_mode"],"passing_score"?: number,"question_count"?: number,"school_level"?: Database["public"]['Enums']["school_level"] | null,"status"?: Database["public"]['Enums']["publication_status"],"target_cefr"?: Database["public"]['Enums']["cefr_level"] | null,"time_limit_minutes"?: number | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_packages_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "question_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_packages_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_questions": {
                  Row: {
                    "package_id": string,"position": number,"question_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "package_id": string,"position"?: number,"question_id": string
                  }
                  Update: {
                    "package_id"?: string,"position"?: number,"question_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_questions_package_id_fkey"
      columns: ["package_id"]
isOneToOne: false
      referencedRelation: "quiz_packages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_questions_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "description": string | null,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string | null,"id": string,"name": string
                  }
                  Update: {
                    "description"?: string | null,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"student_achievements": {
                  Row: {
                    "achievement_id": number,"earned_at": string,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achievement_id": number,"earned_at"?: string,"student_id": string
                  }
                  Update: {
                    "achievement_id"?: number,"earned_at"?: string,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_achievements_achievement_id_fkey"
      columns: ["achievement_id"]
isOneToOne: false
      referencedRelation: "achievements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_achievements_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"student_answers": {
                  Row: {
                    "answered_at": string,"attempt_id": string,"id": string,"is_correct": boolean,"question_id": string,"selected_option_id": string | null,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answered_at"?: string,"attempt_id": string,"id"?: string,"is_correct": boolean,"question_id": string,"selected_option_id"?: string | null,"student_id": string
                  }
                  Update: {
                    "answered_at"?: string,"attempt_id"?: string,"id"?: string,"is_correct"?: boolean,"question_id"?: string,"selected_option_id"?: string | null,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_answers_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "quiz_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_answers_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_answers_selected_option_id_fkey"
      columns: ["selected_option_id"]
isOneToOne: false
      referencedRelation: "question_options"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "student_answers_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"xp_transactions": {
                  Row: {
                    "amount": number,"created_at": string,"id": number,"reason": string,"source_id": string | null,"source_type": string,"student_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"id"?: number,"reason": string,"source_id"?: string | null,"source_type": string,"student_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"id"?: number,"reason"?: string,"source_id"?: string | null,"source_type"?: string,"student_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "xp_transactions_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "_award_achievements":
{ Args: { "p_student": string }; Returns: Json
                           },
"_build_attempt":
{ Args: { "p_assignment": string,"p_category": number,"p_cefr": Database["public"]['Enums']["cefr_level"],"p_learning_mode": Database["public"]['Enums']["learning_mode"],"p_mode": Database["public"]['Enums']["quiz_mode"],"p_package": string,"p_passing": number,"p_question_ids": (string)[],"p_school": Database["public"]['Enums']["school_level"],"p_student": string,"p_time_limit": number,"p_title": string,"p_type": Database["public"]['Enums']["assessment_type"] }; Returns: string
                           },
"_correct_in_category":
{ Args: { "p_slug": string,"p_student": string }; Returns: number
                           },
"_grant_xp":
{ Args: { "p_amount": number,"p_reason": string,"p_source_id": string,"p_source_type": string,"p_student": string }; Returns: undefined
                           },
"_pick_questions":
{ Args: { "p_category": number,"p_cefr": Database["public"]['Enums']["cefr_level"],"p_count": number,"p_difficulty": Database["public"]['Enums']["difficulty_level"],"p_learning_mode": Database["public"]['Enums']["learning_mode"],"p_school": Database["public"]['Enums']["school_level"] }; Returns: (string)[]
                           },
"_question_feedback":
{ Args: { "p_is_correct": boolean,"p_question_id": string }; Returns: Json
                           },
"admin_import_questions":
{ Args: { "p_rows": Json }; Returns: Json
                           },
"admin_save_question":
{ Args: { "p": Json }; Returns: string
                           },
"admin_set_user_role":
{ Args: { "p_role": string,"p_user_id": string }; Returns: undefined
                           },
"answer_question":
{ Args: { "p_attempt_id": string,"p_option_id": string,"p_question_id": string }; Returns: Json
                           },
"can_view_student":
{ Args: { "p_student_id": string }; Returns: boolean
                           },
"current_app_role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"get_admin_overview":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"get_attempt":
{ Args: { "p_attempt_id": string }; Returns: Json
                           },
"get_question_availability":
{ Args: Record<PropertyKey, never>; Returns: {
              "category_slug": string,"cefr_level": Database["public"]['Enums']["cefr_level"],"learning_mode": Database["public"]['Enums']["learning_mode"],"school_level": Database["public"]['Enums']["school_level"],"total": number
            }[]
                           },
"get_student_stats":
{ Args: { "p_student_id"?: string }; Returns: Json
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"join_class":
{ Args: { "p_code": string }; Returns: Json
                           },
"start_package_attempt":
{ Args: { "p_assignment_id"?: string,"p_package_id": string }; Returns: string
                           },
"start_practice":
{ Args: { "p_assessment_type"?: Database["public"]['Enums']["assessment_type"],"p_category_slug"?: string,"p_cefr"?: Database["public"]['Enums']["cefr_level"],"p_count"?: number,"p_difficulty"?: Database["public"]['Enums']["difficulty_level"],"p_learning_mode": Database["public"]['Enums']["learning_mode"],"p_mode"?: Database["public"]['Enums']["quiz_mode"],"p_school_level"?: Database["public"]['Enums']["school_level"],"p_time_limit"?: number,"p_title"?: string }; Returns: string
                           },
"submit_attempt":
{ Args: { "p_attempt_id": string }; Returns: Json
                           },
"teaches_class":
{ Args: { "p_class_id": string }; Returns: boolean
                           },
"teaches_student":
{ Args: { "p_student_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "assessment_type": "diagnostic"|"formative"|"summative"|"daily_practice"|"olympiad_simulation","attempt_status": "in_progress"|"submitted","cefr_level": "A1"|"A2"|"B1"|"B2","difficulty_level": "easy"|"medium"|"hard"|"advanced","learning_mode": "proficiency"|"olympiad","publication_status": "draft"|"published","quiz_mode": "practice"|"exam","school_level": "SMP"|"SMA"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "assessment_type": ["diagnostic", "formative", "summative", "daily_practice", "olympiad_simulation"],"attempt_status": ["in_progress", "submitted"],"cefr_level": ["A1", "A2", "B1", "B2"],"difficulty_level": ["easy", "medium", "hard", "advanced"],"learning_mode": ["proficiency", "olympiad"],"publication_status": ["draft", "published"],"quiz_mode": ["practice", "exam"],"school_level": ["SMP", "SMA"]
          }
        }
} as const
