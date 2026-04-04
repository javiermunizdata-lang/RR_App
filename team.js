// team.js
// Team management (assignment order, drag and drop, breaks)

import { state, saveState } from './state.js';
import { 
    MEMBERS_BY_ID, 
    NC_POSITION_INDEX, 
    NC_EARLY_ACTIVE, 
    NC_LATERS_ACTIVE 
} from './config.js';
import { getCurrentTime } from './utils.js';

export function getTeamMembers(turn) {
    const orderedIds = state.teamOrder[turn] || [];
    return orderedIds
        .map(memberId => {
            const baseMember = MEMBERS_BY_ID[memberId];
            if (!baseMember) return null;
            const config = state.teamConfig[memberId] || {};
            return {
                ...baseMember,
                ...config,
                tickets: config.tickets || 0
            };
        })
        .filter(Boolean);
}

export function getMemberLocation(memberId) {
    for (const turn of ['early', 'laters']) {
        const index = (state.teamOrder[turn] || []).indexOf(memberId);
        if (index !== -1) return { turn, index };
    }
    return null;
}

export function handleDragStart(e, memberId, sourceTurn, sourceIndex) {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('memberId', memberId);
    e.dataTransfer.setData('sourceTurn', sourceTurn);
    e.dataTransfer.setData('sourceIndex', String(sourceIndex));
}

export function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
}

export function moveMember(memberId, sourceTurn, sourceIndex, targetTurn, targetIndex) {
    if (!memberId || !targetTurn) return false;

    let actualSourceTurn = sourceTurn;
    let actualSourceIndex = Number.isInteger(Number(sourceIndex)) ? Number(sourceIndex) : -1;
    
    if (!actualSourceTurn || actualSourceIndex < 0) {
        const location = getMemberLocation(memberId);
        if (!location) return false;
        actualSourceTurn = location.turn;
        actualSourceIndex = location.index;
    }

    const sourceList = state.teamOrder[actualSourceTurn];
    const targetList = state.teamOrder[targetTurn];
    if (!sourceList || !targetList) return false;
    if (!sourceList.includes(memberId)) return false;

    const verifiedSourceIndex = sourceList.indexOf(memberId);
    sourceList.splice(verifiedSourceIndex, 1);

    let insertIndex = Number.isInteger(Number(targetIndex)) ? Number(targetIndex) : targetList.length;
    if (actualSourceTurn === targetTurn && verifiedSourceIndex < insertIndex) {
        insertIndex -= 1;
    }
    insertIndex = Math.max(0, Math.min(insertIndex, targetList.length));

    targetList.splice(insertIndex, 0, memberId);
    
    if (state.teamConfig[memberId]) {
        state.teamConfig[memberId].turn = targetTurn;
    }

    state.rrIndex = 0;
    saveState();
    return true;
}

export function handleDropOnMember(e, targetTurn, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    const memberId = e.dataTransfer.getData('memberId');
    const sourceTurn = e.dataTransfer.getData('sourceTurn');
    const sourceIndex = Number.parseInt(e.dataTransfer.getData('sourceIndex'), 10);
    moveMember(memberId, sourceTurn, sourceIndex, targetTurn, targetIndex);
}

export function handleDropOnList(e, targetTurn) {
    e.preventDefault();
    const memberId = e.dataTransfer.getData('memberId');
    const sourceTurn = e.dataTransfer.getData('sourceTurn');
    const sourceIndex = Number.parseInt(e.dataTransfer.getData('sourceIndex'), 10);
    moveMember(memberId, sourceTurn, sourceIndex, targetTurn, null);
}

export function isNCTimeActive(turn, hour = getCurrentTime()) {
    const window = turn === 'early' ? NC_EARLY_ACTIVE : NC_LATERS_ACTIVE;
    return hour >= window.start && hour < window.end;
}

export function toggleBreak(memberId) {
    if (!state.breaks[memberId]) {
        state.breaks[memberId] = true;
    } else {
        delete state.breaks[memberId];
    }
    saveState();
}

export function isOnBreak(memberId) {
    return !!state.breaks[memberId];
}

export function getAssignableMembers(turn) {
    const members = getTeamMembers(turn);
    const ncIsActive = isNCTimeActive(turn);
    return members.filter((member, index) => {
        if (isOnBreak(member.id)) return false;
        if (index === NC_POSITION_INDEX && !ncIsActive) return false;
        return true;
    });
}
