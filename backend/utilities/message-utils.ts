import { StatusCodes } from "http-status-codes";
import { IMessage } from "../models/message-model";
import { BaseResponse, Utils } from "./utils";

export type MessageResponse = BaseResponse<IMessage[]>

export class MessageUtils extends Utils {

    /**
     * Send a message from one user to another to the database unencrypted 
     * @param sender_uid Sender User ID 
     * @param receiver_uid Receiver User ID
     * @param content Message content
     * @returns A MessageResponse object containing statusCode, data, and optional error message
     */
    async sendMessage(sender_uid: number, receiver_uid: number, content: string, nonce: string): Promise<BaseResponse<IMessage>> {
        if (!this.isValidUserId(sender_uid) || !this.isValidUserId(receiver_uid)) {
            return this.createErrorResponse(
                StatusCodes.BAD_REQUEST,
                'Invalid UID'
            );
        }

        if (!(await this.userExists(sender_uid)) || !(await this.userExists(receiver_uid))) {
            return this.createErrorResponse(
                StatusCodes.NOT_FOUND,
                'User not found'
            );
        }

        if (sender_uid === receiver_uid) {
            return this.createErrorResponse(
                StatusCodes.BAD_REQUEST,
                'Cannot send message to self'
            );
        }

        if (!(await this.hasContactWith(sender_uid, receiver_uid))) {
            return this.createErrorResponse(
                StatusCodes.FORBIDDEN,
                'Users are not contacts'
            );
        }

        const messagePermission = await this.canSendMessage(sender_uid, receiver_uid);
        if (!messagePermission.canSend) {
            if (messagePermission.reason === 'you_blocked') {
                return this.createErrorResponse(
                    StatusCodes.FORBIDDEN,
                    'Cannot message, you have blocked this user'
                );
            } else if (messagePermission.reason === 'user_blocked') {
                return this.createErrorResponse(
                    StatusCodes.FORBIDDEN,
                    'Cannot message user, user has blocked you'
                );
            } else {
                return this.createErrorResponse(
                    StatusCodes.FORBIDDEN,
                    'Cannot send message to this user'
                );
            }
        }

        try {
            const result = await this.dbSession.query(`
            INSERT INTO message (sender_uid, receiver_uid, content, nonce)
            VALUES ($1, $2, $3, $4)
            RETURNING mid, sender_uid, receiver_uid, content, nonce, timestamp`,
                [sender_uid, receiver_uid, content, nonce]
            );

            if (result.rowCount === 0) {
                return this.createErrorResponse(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Failed to send message'
                );
            }

            const message: IMessage = {
                mid: result.rows[0].mid,
                sender_uid: result.rows[0].sender_uid,
                receiver_uid: result.rows[0].receiver_uid,
                content: result.rows[0].content,
                nonce: result.rows[0].nonce,
                timestamp: result.rows[0].timestamp
            };

            return this.createSuccessResponse(message);
        } catch (error) {
            console.error('Error sending message:', error);
            return this.createErrorResponse(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to send message.'
            );
        }
    }

    /**
     * Fetches messages between two users
     * @param sender_uid The ID of the sender
     * @param receiver_uid The ID of the receiver
     * @returns A MessageResponse object containing statusCode, data, and optional error message
     */
    public async fetchMessage(sender_uid: number, receiver_uid: number): Promise<MessageResponse> {
        if (!this.isValidUserId(sender_uid) || !this.isValidUserId(receiver_uid)) {
            return this.createErrorResponse(
                StatusCodes.BAD_REQUEST,
                'Invalid UID'
            );
        }

        if (!(await this.userExists(sender_uid)) || !(await this.userExists(receiver_uid))) {
            return this.createErrorResponse(
                StatusCodes.NOT_FOUND,
                'User not found'
            );
        }

        if (sender_uid === receiver_uid) {
            return this.createErrorResponse(
                StatusCodes.BAD_REQUEST,
                'Cannot fetch messages with self'
            );
        }

        try {
            const result = await this.dbSession.query(`
            SELECT m.mid, m.sender_uid, m.receiver_uid, m.content, m.nonce, m.timestamp
            FROM message m
            WHERE (m.sender_uid = $1 AND m.receiver_uid = $2) 
               OR (m.sender_uid = $2 AND m.receiver_uid = $1)
            ORDER BY m.timestamp ASC`,
                [sender_uid, receiver_uid]
            );

            const messages: IMessage[] = result.rows.map(row => ({
                mid: row.mid,
                sender_uid: row.sender_uid,
                receiver_uid: row.receiver_uid,
                content: row.content,
                nonce: row.nonce,
                timestamp: row.timestamp
            }));

            return this.createSuccessResponse(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            return this.createErrorResponse(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to fetch messages.'
            );
        }
    }

    /**
     * Deletes messages from the server after they have been received and stored locally
     * @param receiver_uid The ID of the user who received the messages
     * @param messageIds Array of message IDs to delete
     * @returns A BaseResponse object containing statusCode and optional error message
     */
    public async deleteReceivedMessages(receiver_uid: number, messageIds: number[]): Promise<BaseResponse<{ deleted: number }>> {
        if (!this.isValidUserId(receiver_uid)) {
            return this.createErrorResponse(
                StatusCodes.BAD_REQUEST,
                'Invalid user ID'
            );
        }

        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return this.createErrorResponse(
                StatusCodes.BAD_REQUEST,
                'No message IDs provided'
            );
        }

        try {
            // Filter out any null, undefined, or non-number values
            const validMessageIds = messageIds
                .filter(id => id !== null && id !== undefined)
                .map(id => parseInt(id as any))
                .filter(id => !isNaN(id));

            if (validMessageIds.length === 0) {
                return this.createErrorResponse(
                    StatusCodes.BAD_REQUEST,
                    'No valid message IDs provided'
                );
            }

            // Only delete messages where the current user is the receiver
            const result = await this.dbSession.query(`
            DELETE FROM message 
            WHERE receiver_uid = $1 
            AND mid = ANY($2)
            RETURNING mid`,
                [receiver_uid, validMessageIds]
            );

            return this.createSuccessResponse({
                deleted: result.rowCount || 0
            });
        } catch (error) {
            console.error('Error deleting received messages:', error);
            return this.createErrorResponse(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to delete received messages'
            );
        }
    }
}
