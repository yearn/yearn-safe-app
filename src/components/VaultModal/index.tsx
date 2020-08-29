import React, { ReactElement, useState, ChangeEvent, useCallback } from "react";
import { ModalFooterConfirmation, GenericModal, Text, TextField, Button } from "@gnosis.pm/safe-react-components";

import styled from "styled-components";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { useSendTransactions } from "../../contexts/SafeContext";
import { VaultAsset } from "../../@types";
import vaultDepositTxs from "../../utils/transactions/vaultDespositTxs";
import vaultWithdrawTxs from "../../utils/transactions/vaultWithdrawTxs";
import { BigNumberToRoundedHumanFormat } from "../../utils";

const StyledItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 24px;
  height: 51px;
`;

interface Props {
  vaultAsset: VaultAsset | null;
  setVaultAsset: (newVaultAsset: VaultAsset | null) => void;
  action: "deposit" | "withdraw";
}

const VaultModal = ({ vaultAsset, setVaultAsset, action }: Props): ReactElement | null => {
  const sendTransactions = useSendTransactions();
  /** State Variables **/
  const [amount, setAmount] = useState<string>("");

  const performAction = useCallback(
    (actionAmount: BigNumber) => {
      if (actionAmount.gt(0)) {
        const txs =
          action === "deposit"
            ? vaultDepositTxs(vaultAsset as VaultAsset, actionAmount)
            : vaultWithdrawTxs(vaultAsset as VaultAsset, actionAmount);
        sendTransactions(txs);
      }
    },
    [action, sendTransactions, vaultAsset],
  );

  const closeModal = () => {
    setAmount("0");
    setVaultAsset(null);
  };

  if (vaultAsset === null) return null;
  const capitalisedAction = action[0].toUpperCase() + action.slice(1);
  const assetSymbol = action === "deposit" ? vaultAsset.symbol : vaultAsset.vaultSymbol;
  const maxAmount = action === "deposit" ? vaultAsset.balance : vaultAsset.vaultBalance;

  const modalTitle = `${capitalisedAction} ${vaultAsset.symbol}`;

  const modalBody = (
    <>
      <StyledItem>
        <Text size="lg">Balance</Text>
        <Text size="lg">{`${BigNumberToRoundedHumanFormat(maxAmount, vaultAsset.decimals)} ${assetSymbol}`}</Text>
      </StyledItem>
      <StyledItem>
        <Text size="lg">{`${capitalisedAction} Amount`}</Text>
        <TextField
          style={{ width: "200px" }}
          label="Amount"
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setAmount(e.target.value)}
        />
      </StyledItem>
      <StyledItem>
        <Button
          size="md"
          color="primary"
          onClick={() => setAmount(formatUnits(BigNumber.from(maxAmount).div(4), vaultAsset.decimals))}
        >
          25%
        </Button>
        <Button
          size="md"
          color="primary"
          onClick={() => setAmount(formatUnits(BigNumber.from(maxAmount).div(2), vaultAsset.decimals))}
        >
          50%
        </Button>
        <Button
          size="md"
          color="primary"
          onClick={() =>
            setAmount(
              formatUnits(
                BigNumber.from(maxAmount)
                  .mul(3)
                  .div(4),
                vaultAsset.decimals,
              ),
            )
          }
        >
          75%
        </Button>
        <Button
          size="md"
          color="primary"
          onClick={() => setAmount(formatUnits(BigNumber.from(maxAmount), vaultAsset.decimals))}
        >
          100%
        </Button>
      </StyledItem>
    </>
  );

  const modalFooter = (
    <ModalFooterConfirmation
      okText={`${capitalisedAction}`}
      // okDisabled={false}
      handleCancel={closeModal}
      handleOk={() => {
        console.log(`${action}ing ${amount} tokens`);
        performAction(parseUnits(amount, vaultAsset.decimals));
      }}
    />
  );

  return <GenericModal onClose={closeModal} title={modalTitle} body={modalBody} footer={modalFooter} />;
};

export default VaultModal;