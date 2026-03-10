export interface UserData {
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    maxRank?: string;
    titlePhoto: string;
    avatar: string;
    contribution: number;
    friendOfCount: number;
}

export interface RatingChange {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

export interface Problem {
    contestId?: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
}

export interface Submission {
    id: number;
    contestId?: number;
    creationTimeSeconds: number;
    relativeTimeSeconds: number;
    problem: Problem;
    author: {
        contestId?: number;
        members: { handle: string }[];
        participantType: string;
        ghost: boolean;
        startTimeSeconds?: number;
    };
    programmingLanguage: string;
    verdict: string;
    testset: string;
    passedTestCount: number;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
}

export interface Contest {
    id: number;
    name: string;
    type: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    relativeTimeSeconds: number;
}

export class APIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'APIError';
    }
}

const CF_API_BASE = 'https://codeforces.com/api';

async function fetchCF<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${CF_API_BASE}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status === 'OK') {
            return data.result;
        } else {
            throw new APIError(data.comment || 'Codeforces API error');
        }
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new Error('Failed to fetch data from Codeforces API');
    }
}

export const codeforcesAPI = {
    getUserInfo: async (handle: string | string[]): Promise<UserData[]> => {
        const handles = Array.isArray(handle) ? handle.join(';') : handle;
        const users = await fetchCF<UserData[]>('/user.info', { handles });
        if (!users || users.length === 0) {
            throw new APIError('User not found');
        }
        return users;
    },

    getUserRating: async (handle: string): Promise<RatingChange[]> => {
        return fetchCF<RatingChange[]>('/user.rating', { handle });
    },

    getUserStatus: async (handle: string, from = 1, count = 10000): Promise<Submission[]> => {
        return fetchCF<Submission[]>('/user.status', {
            handle,
            from: from.toString(),
            count: count.toString()
        });
    },

    getProblemset: async (tags?: string[]): Promise<{ problems: Problem[], problemStatistics: any[] }> => {
        const params: Record<string, string> = {};
        if (tags && tags.length > 0) {
            params.tags = tags.join(';');
        }
        return fetchCF('/problemset.problems', params);
    },

    getProblems: async (tags?: string[]): Promise<Problem[]> => {
        const data = await codeforcesAPI.getProblemset(tags);
        return data.problems;
    },

    getContestList: async (gym = false): Promise<Contest[]> => {
        return fetchCF<Contest[]>('/contest.list', { gym: gym.toString() });
    }
};
